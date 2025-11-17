# FitnessFlow - Cloud Sync & Multi-Device Support

## What's New

Your training programs are now automatically saved to the cloud and synchronized across all your devices!

---

## Features

### Cloud Storage
- All your programs are securely stored on Supabase cloud
- Automatic backup of your data
- Never lose your training progress

### Multi-Device Access
- Create a program on your phone
- Access it immediately on your laptop
- All your devices stay in sync automatically

### Offline Support
- Programs work even without internet
- Cached locally for instant access
- Automatic sync when you're back online

### Program History
- Access all your past programs
- Switch between different programs easily
- Track your training evolution over time

---

## How It Works

### Creating Programs

1. Complete your onboarding and screening
2. Click "Genera Programma Personalizzato"
3. Your program is automatically saved to the cloud
4. Look for the green "Sincronizzato" indicator

### Accessing Programs

**On the same device:**
- Programs load instantly from cache
- No internet needed for viewing

**On a different device:**
- Login with your account
- Your active program loads automatically
- All your program history is available

### Managing Multiple Programs

1. Click the "Storico" button (appears when you have 2+ programs)
2. View all your programs:
   - Active program (green badge)
   - Previous programs
3. Switch between programs:
   - Click "Attiva Programma" on any old program
   - It becomes your active program
   - Previous active program moves to history

---

## Sync Status Indicators

### Green - "Sincronizzato"
- Everything is synced with the cloud
- You're online and connected
- Data is safely backed up

### Blue - "Sincronizzazione..."
- Currently saving to the cloud
- Wait for green indicator
- Usually takes 1-2 seconds

### Amber - "Offline"
- No internet connection
- Using cached data
- Will sync automatically when online

---

## Quick Start Guide

### First Time Setup

1. **Login or Signup**
   - Use your email and password
   - Authentication is required for cloud sync

2. **Complete Profile**
   - Fill out onboarding form
   - Take the theory quiz
   - Complete screening assessment

3. **Generate Your First Program**
   - Click "Genera Programma"
   - Wait for sync confirmation
   - Your program is now in the cloud!

### Daily Use

1. **Open Dashboard**
   - Your active program loads automatically
   - Check sync status (should be green)

2. **Start Training**
   - Click "Inizia Allenamento"
   - Track your progress
   - Changes auto-save

3. **Switch Devices**
   - Login on any device
   - Same program appears
   - Continue where you left off

---

## FAQ

### Q: Do I need internet to use my program?
**A:** No! Programs are cached locally and work offline. You only need internet to sync changes or load on a new device.

### Q: What happens if I create a new program?
**A:** The new program becomes active automatically. Your old program is saved in history and can be reactivated anytime.

### Q: Can I have multiple active programs?
**A:** No, only one program can be active at a time. This keeps your training focused. You can switch between programs using the history feature.

### Q: What if I'm offline when I generate a program?
**A:** The program saves to your device's localStorage. When you're back online, it will sync to the cloud automatically.

### Q: How do I access my old programs?
**A:** Click the "Storico" button in the dashboard header. All your programs are listed there with creation dates.

### Q: Is my data secure?
**A:** Yes! Your data is:
- Encrypted in transit (HTTPS)
- Isolated per user (RLS policies)
- Stored on secure Supabase infrastructure
- Only accessible with your login credentials

### Q: Can I delete programs?
**A:** Currently, programs are archived but not deleted. This preserves your training history. Contact support if you need a program permanently removed.

### Q: What if the sync fails?
**A:** If sync fails:
1. Check your internet connection
2. Try refreshing the page
3. Your data is safe in localStorage
4. Sync will retry automatically when online

---

## Troubleshooting

### Problem: Sync indicator shows "Offline"

**Solutions:**
1. Check your internet connection
2. Refresh the page
3. Logout and login again
4. Clear browser cache (your programs are in the cloud)

### Problem: Program not loading

**Solutions:**
1. Check sync indicator status
2. If green, refresh page
3. If offline, check internet
4. Try logging out and back in

### Problem: Old program showing instead of new one

**Solutions:**
1. Check "Storico" - verify which is marked active
2. Clear browser cache
3. Refresh page
4. In history, re-activate the correct program

### Problem: Duplicate programs after sync

**Solutions:**
1. This shouldn't happen (enforced by database)
2. If it does, contact support
3. Temporary fix: Activate the program you want

---

## Technical Details

### Data Stored in Cloud

- Program name and description
- Training level and goals
- Exercise list and weekly split
- Program timeline (start/end dates)
- Progress tracking data
- Equipment preferences
- Pain areas and corrections

### Cache Duration

- Active program: 5 minutes
- Program history: 5 minutes
- After cache expires, data refreshes from cloud

### Sync Behavior

- **Create program:** Immediate sync to cloud
- **Load program:** Check cache first, then cloud
- **Update program:** Sync on save
- **Switch active:** Update both devices instantly

---

## Updates & Changelog

### Version 1.0.0 (2025-11-17)
- Initial cloud sync implementation
- Multi-device support
- Program history feature
- Offline mode with cache
- Automatic localStorage migration

---

## Support

If you experience issues:

1. Check this FAQ first
2. Verify your internet connection
3. Try the troubleshooting steps
4. Contact support with:
   - Your email
   - What you were doing
   - Error message (if any)
   - Browser console errors (F12 → Console)

---

## Best Practices

1. **Stay Logged In**
   - Keep your session active
   - Logout only when needed
   - Enables continuous sync

2. **Check Sync Status**
   - Green = all good
   - Amber = wait for internet
   - Blue = give it a second

3. **Regular Backups**
   - Your data is automatically backed up
   - But you can export programs (future feature)

4. **One Active Program**
   - Focus on one program at a time
   - Use history to switch when needed
   - Archive old programs

---

## Privacy & Data

### What We Store
- Your training programs
- Exercise history
- Assessment results
- User preferences

### What We DON'T Store
- Credit card details
- Biometric data
- Location tracking
- Third-party integrations

### Your Rights
- Access your data anytime
- Export your programs
- Delete your account
- Request data removal

---

## Coming Soon

- [ ] Program sharing with friends
- [ ] Export programs to PDF
- [ ] Advanced analytics
- [ ] Multiple active programs (Pro feature)
- [ ] Automatic progression tracking
- [ ] Integration with fitness trackers

---

**Enjoy your cloud-synced training experience!**

For questions or feedback: support@fitnessflow.com

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
