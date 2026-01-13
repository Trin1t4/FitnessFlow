#!/bin/bash
# ============================================================================
# TRAINSMART CONSISTENCY FIXES - MIGRATION SCRIPT
# ============================================================================
#
# Questo script applica tutti i fix di coerenza al codebase TrainSmart.
#
# PREREQUISITI:
# - Node.js 18+
# - npm o yarn
# - Git (per backup)
#
# USAGE:
#   chmod +x migrate.sh
#   ./migrate.sh [--dry-run] [--skip-backup]
#
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
SKIP_BACKUP=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      ;;
  esac
done

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}TRAINSMART CONSISTENCY FIXES${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  DRY RUN MODE - No changes will be made${NC}"
  echo ""
fi

# Paths
SHARED_UTILS="packages/shared/src/utils"
WEB_LIB="packages/web/src/lib"
SHARED_TESTS="packages/shared/src/__tests__"

# ============================================================================
# STEP 1: BACKUP
# ============================================================================

if [ "$SKIP_BACKUP" = false ]; then
  echo -e "${BLUE}Step 1: Creating backup...${NC}"
  
  BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
  
  if [ "$DRY_RUN" = false ]; then
    mkdir -p "$BACKUP_DIR"
    
    # Backup files that will be modified
    [ -f "$SHARED_UTILS/goalMapper.ts" ] && cp "$SHARED_UTILS/goalMapper.ts" "$BACKUP_DIR/"
    [ -f "$SHARED_UTILS/programGenerator.ts" ] && cp "$SHARED_UTILS/programGenerator.ts" "$BACKUP_DIR/"
    [ -f "$SHARED_UTILS/weeklySplitGenerator.ts" ] && cp "$SHARED_UTILS/weeklySplitGenerator.ts" "$BACKUP_DIR/"
    [ -f "$WEB_LIB/goalMappings.ts" ] && cp "$WEB_LIB/goalMappings.ts" "$BACKUP_DIR/"
    [ -f "$WEB_LIB/fixedGoalMappings.js" ] && cp "$WEB_LIB/fixedGoalMappings.js" "$BACKUP_DIR/"
    
    echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"
  else
    echo -e "${YELLOW}  Would create backup at: $BACKUP_DIR${NC}"
  fi
else
  echo -e "${YELLOW}Step 1: Skipping backup (--skip-backup flag)${NC}"
fi

echo ""

# ============================================================================
# STEP 2: INSTALL NEW FILES
# ============================================================================

echo -e "${BLUE}Step 2: Installing new files...${NC}"

# 2.1 Unified Goal Mapper
echo "  → Installing unified goal mapper..."
if [ "$DRY_RUN" = false ]; then
  cp "01-unified-goal-mapper.ts" "$SHARED_UTILS/goalMapper.ts"
  echo -e "${GREEN}    ✓ $SHARED_UTILS/goalMapper.ts${NC}"
else
  echo -e "${YELLOW}    Would install: $SHARED_UTILS/goalMapper.ts${NC}"
fi

# 2.2 Universal Safety Caps
echo "  → Installing universal safety caps..."
if [ "$DRY_RUN" = false ]; then
  cp "03-universal-safety-caps.ts" "$SHARED_UTILS/safetyCaps.ts"
  echo -e "${GREEN}    ✓ $SHARED_UTILS/safetyCaps.ts${NC}"
else
  echo -e "${YELLOW}    Would install: $SHARED_UTILS/safetyCaps.ts${NC}"
fi

# 2.3 Unified Program Generator
echo "  → Installing unified program generator..."
if [ "$DRY_RUN" = false ]; then
  cp "02-unified-program-generator.ts" "$SHARED_UTILS/unifiedProgramGenerator.ts"
  echo -e "${GREEN}    ✓ $SHARED_UTILS/unifiedProgramGenerator.ts${NC}"
else
  echo -e "${YELLOW}    Would install: $SHARED_UTILS/unifiedProgramGenerator.ts${NC}"
fi

# 2.4 Regression Tests
echo "  → Installing regression tests..."
if [ "$DRY_RUN" = false ]; then
  mkdir -p "$SHARED_TESTS"
  cp "04-regression-tests.ts" "$SHARED_TESTS/regression.test.ts"
  echo -e "${GREEN}    ✓ $SHARED_TESTS/regression.test.ts${NC}"
else
  echo -e "${YELLOW}    Would install: $SHARED_TESTS/regression.test.ts${NC}"
fi

echo ""

# ============================================================================
# STEP 3: REMOVE DEPRECATED FILES
# ============================================================================

echo -e "${BLUE}Step 3: Removing deprecated files...${NC}"

DEPRECATED_FILES=(
  "$WEB_LIB/goalMappings.ts"
  "$WEB_LIB/fixedGoalMappings.js"
)

for file in "${DEPRECATED_FILES[@]}"; do
  if [ -f "$file" ]; then
    if [ "$DRY_RUN" = false ]; then
      rm "$file"
      echo -e "${GREEN}    ✓ Removed: $file${NC}"
    else
      echo -e "${YELLOW}    Would remove: $file${NC}"
    fi
  else
    echo -e "${YELLOW}    Already removed: $file${NC}"
  fi
done

echo ""

# ============================================================================
# STEP 4: UPDATE EXPORTS
# ============================================================================

echo -e "${BLUE}Step 4: Updating exports in index.ts...${NC}"

INDEX_FILE="$SHARED_UTILS/index.ts"

EXPORTS_TO_ADD='
// Safety Caps (Universal)
export {
  calculateSafetyLimits,
  applySafetyCap,
  applySafetyCapSimple,
  getTargetRIR,
  getRIRConfig,
  getMaxSets,
  canAccessIntensity,
  formatSafetyReport,
  createSafetyContext,
  type SafetyContext,
  type SafetyResult,
  type DayType,
  type DiscrepancyType
} from "./safetyCaps";

// Unified Program Generator
export {
  generateProgramUnified,
  type UnifiedProgramOptions,
  type UnifiedProgramResult
} from "./unifiedProgramGenerator";
'

if [ "$DRY_RUN" = false ]; then
  # Check if exports already exist
  if ! grep -q "safetyCaps" "$INDEX_FILE" 2>/dev/null; then
    echo "$EXPORTS_TO_ADD" >> "$INDEX_FILE"
    echo -e "${GREEN}    ✓ Added exports to index.ts${NC}"
  else
    echo -e "${YELLOW}    Exports already exist in index.ts${NC}"
  fi
else
  echo -e "${YELLOW}    Would add exports to index.ts${NC}"
fi

echo ""

# ============================================================================
# STEP 5: UPDATE IMPORTS IN DEPENDENT FILES
# ============================================================================

echo -e "${BLUE}Step 5: Updating imports in dependent files...${NC}"

# Files that need import updates
IMPORT_UPDATE_FILES=(
  "$SHARED_UTILS/weeklySplitGenerator.ts"
  "$SHARED_UTILS/programGenerator.ts"
  "packages/web/src/components/Dashboard.tsx"
  "packages/web/src/components/onboarding/GoalStep.tsx"
)

for file in "${IMPORT_UPDATE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  → Checking: $file"
    
    if [ "$DRY_RUN" = false ]; then
      # Replace old imports with new unified imports
      # Note: This is a simplified version - manual review recommended
      
      # Add import for safetyCaps if using safety functions
      if grep -q "getMaxAllowedIntensity\|applySafetyCap\|getTargetRIR" "$file" 2>/dev/null; then
        if ! grep -q "from.*safetyCaps" "$file" 2>/dev/null; then
          echo -e "${YELLOW}    ⚠️  Needs manual import update for safetyCaps${NC}"
        fi
      fi
      
      # Add import for goalMapper if using goal functions
      if grep -q "toCanonicalGoal\|toProgramGoal\|getGoalConfig" "$file" 2>/dev/null; then
        if ! grep -q "from.*goalMapper" "$file" 2>/dev/null; then
          echo -e "${YELLOW}    ⚠️  Needs manual import update for goalMapper${NC}"
        fi
      fi
    else
      echo -e "${YELLOW}    Would update imports in: $file${NC}"
    fi
  fi
done

echo ""

# ============================================================================
# STEP 6: RUN TYPE CHECK
# ============================================================================

echo -e "${BLUE}Step 6: Running type check...${NC}"

if [ "$DRY_RUN" = false ]; then
  if command -v npx &> /dev/null; then
    echo "  → Running tsc..."
    npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 || {
      echo -e "${RED}    ✗ Type errors found - please fix manually${NC}"
    }
  else
    echo -e "${YELLOW}    npx not found - skipping type check${NC}"
  fi
else
  echo -e "${YELLOW}    Would run: npx tsc --noEmit${NC}"
fi

echo ""

# ============================================================================
# STEP 7: RUN TESTS
# ============================================================================

echo -e "${BLUE}Step 7: Running regression tests...${NC}"

if [ "$DRY_RUN" = false ]; then
  if command -v npx &> /dev/null; then
    echo "  → Running tests..."
    npx vitest run --reporter=verbose packages/shared/src/__tests__/regression.test.ts 2>&1 || {
      echo -e "${RED}    ✗ Some tests failed - please review${NC}"
    }
  else
    echo -e "${YELLOW}    npx not found - skipping tests${NC}"
  fi
else
  echo -e "${YELLOW}    Would run: npx vitest run regression.test.ts${NC}"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}MIGRATION SUMMARY${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}DRY RUN COMPLETE - No changes were made${NC}"
  echo ""
  echo "To apply changes, run without --dry-run flag:"
  echo "  ./migrate.sh"
else
  echo -e "${GREEN}MIGRATION COMPLETE${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Review type errors and fix manually"
  echo "  2. Update imports in files marked with ⚠️"
  echo "  3. Run full test suite: npm test"
  echo "  4. Test in development: npm run dev"
  echo ""
  echo "Manual updates required:"
  echo "  - Update Dashboard.tsx to use generateProgramUnified()"
  echo "  - Update GoalStep.tsx to use toCanonicalGoal()"
  echo "  - Update any API routes using generateProgramAPI()"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
