# Skills Verification System - Quick Start Guide

## What Was Built

A complete **Professional Skills Verification & Certification System** where service providers (plumbers, electricians, etc.) can:

1. **Register** their business with basic info
2. **Select Skills** they specialize in
3. **Take Practical Tests** (10 scenario-based questions each)
4. **Get Certified** with auto-generated certificates
5. **Build Credibility** by showcasing verified skills

---

## How to Test It

### 1. Start the Dev Server
```bash
cd /home/mohitraj8503/Videos/seva-sansaar-main\(1\)/seva-sansaar-main
npm run dev
```
Server runs on: `http://localhost:3001`

### 2. Navigate to Registration
```
http://localhost:3001/register-with-skills
```

### 3. Complete Step 1: Basic Info
Fill in:
- Email: `plumber@example.com`
- Password: `test123`
- Name: `John Repair Services`
- Phone: `+919876543210`
- City: `Jamshedpur`
- Address: `Main Street, Jamshedpur`

Click: **Next: Verify Skills**

### 4. Step 2: Select Skills
- Click on "Plumbing" (or "Electrical Work")
- You'll see: "10 Questions • 10-15 mins"
- Click: **Proceed to Tests**

### 5. Take the Test
- You'll see practical scenario questions
- Each question has 4 options (A, B, C, D)
- Example question:
  ```
  Scenario: Customer reports water continuously dripping 
            from a tap despite turning it off.
  
  Q: What is the most likely issue?
  A) The water pressure is too high
  B) The tap washer is worn out and needs replacement ← CORRECT
  C) The pipes are frozen
  D) The water heater is malfunctioning
  ```
- Answer all 10 questions
- Click: **Submit Test**

### 6. View Results
- You'll see your score (e.g., "85%")
- See a detailed review of your answers
- If score >= 70%: Certificate earned! ✓
- If score < 70%: Option to retake

### 7. Step 3: Confirm & Complete
- Review your business info
- Review your certification(s)
- Click: **Complete Registration**
- ✅ Registration complete!

---

## Test Data At a Glance

### Plumbing Test (10 Questions)
Topics covered:
- Dripping taps and washers
- Drain clogs and plunging
- Pipe leaks and soldering
- Water pressure issues
- Burst pipe emergency response
- Toilet water seals
- Hot water issues
- Water hammer prevention
- Safety precautions
- Running toilet repairs

**Passing Score:** 70%
**Time Limit:** 30 minutes

### Electrical Work Test (10 Questions)
Topics covered:
- Circuit breaker tripping
- Electrical safety protocols
- GFCI socket reset
- Circuit control mechanisms
- Cord safety hazards
- Flickering lights
- Wire connector standards
- Wire color coding
- Live wire testing
- High electricity bills diagnostics

**Passing Score:** 70%
**Time Limit:** 30 minutes

---

## Key Features to Explore

### ✅ Dynamic Progress Tracking
- Visual number buttons showing 1-10 for each question
- Green = answered, Orange = current, Gray = unanswered
- Progress bar at the top

### ✅ Smart Navigation
- Next/Previous buttons
- Click any question number to jump
- Can review before submitting

### ✅ Real-Time Timer
- 30-minute countdown
- Display in red if running out
- Auto-submits if time expires

### ✅ Detailed Feedback
- See which answers were correct/incorrect
- Read explanations for every answer
- Educational value even if you fail

### ✅ Certificate Generation
- Automatic on passing
- Unique Certificate ID
- Verification code for sharing
- 2-year validity

### ✅ Multi-Skill Support
- Select multiple skills
- Take tests sequentially
- Track progress across all skills
- Get multiple certificates

---

## Test Scenarios (Examples)

### Plumbing Q2: Drain Clog Troubleshooting
```
Scenario: Customer's bathroom sink drains slowly when someone 
          applies pressure, then backs up quickly again.

Question: What's your diagnostic approach?

Options:
A) Use a chemical drain cleaner immediately
B) Check for blockage using a plumbing snake; identify if it's 
   in the P-trap or further down ← CORRECT ANSWER
C) Replace the entire drain pipe
D) Install a new sink

Explanation: Always diagnose the blockage location first. A plumbing 
snake helps identify if the blockage is in the accessible P-trap or 
requires further investigation.
```

### Electrical Q3: GFCI Socket Issues
```
Scenario: Customer says one specific wall socket is dead while 
          nearby sockets work fine.

Question: How do you diagnose?

Options:
A) The wiring to that socket must be broken
B) Check if the socket has a built-in reset button (GFCI); 
   press it to restore power ← CORRECT ANSWER
C) Replace the socket immediately
D) The circuit breaker is bad

Explanation: Many outlets in kitchens, bathrooms, and outdoors are 
GFCI protected. They have a reset button that sometimes trips to 
protect against ground faults.
```

---

## Files Created

```
📁 System Files Created:
├─ src/lib/types/skills.ts
│  └─ Type definitions (SkillCategory, Skill, TestAttempt, etc.)
├─ src/lib/skillsTestData.ts
│  └─ 10 plumbing + 10 electrical questions with answers
├─ src/components/skills/
│  ├─ SkillsSelection.tsx (skill picker)
│  ├─ TestQuestionnaire.tsx (interactive test UI)
│  └─ SkillsVerificationFlow.tsx (orchestrates entire flow)
├─ src/app/api/skills/test/route.ts
│  └─ POST/GET endpoints for test submission & retrieval
├─ src/app/[locale]/register-with-skills/page.tsx
│  └─ Main 3-step registration page
├─ SKILLS_VERIFICATION_GUIDE.md
│  └─ Complete documentation & architecture
└─ This file: QUICK_START.md
```

---

## Demo Credentials

### Admin Login (from earlier setup)
```
Username: admin
Password: admin123
```

### Service Provider Registration
```
Email: any valid email (e.g., plumber@test.com)
Password: any 6+ char password
Name: Your service name
City: Any city (e.g., Jamshedpur)
```

---

## Testing Different Scenarios

### Scenario 1: Pass a Test
1. Go through test carefully
2. Select correct answers
3. Score should be 70%+
4. Certificate automatically generated

### Scenario 2: Fail a Test
1. Answer randomly or carelessly
2. Score comes below 70%
3. See "Test Not Passed" message
4. Click "Retake Test" to try again

### Scenario 3: Multiple Skills
1. In skills selection, check both "Plumbing" AND "Electrical Work"
2. You'll see "2 skills selected"
3. Take Plumbing test first (15 questions total)
4. Progress shows both tests side-by-side
5. After both: 2 certificates earned

### Scenario 4: Incomplete Test
1. Answer only first 5 questions
2. Try to submit test
3. See alert: "You have 5 unanswered questions"
4. Must answer all 10 before submitting

---

## Expected Output After Registration

### On Certificate Page
```
✓ Congratulations!
You have successfully passed the test and 
earned a certificate!

Score: 85%
Details: 8 out of 10 correct

Certificate ID: cert-1712864400000
Verification Code: A7B2K9X4
Valid until: April 11, 2028
```

### In Profile (after completing registration)
```
Certified Skills:
✓ Plumbing - 85% - Certified
✓ Electrical Work - 75% - Certified
```

---

## Troubleshooting

### Q: Test page won't load?
A: Make sure dev server is running on port 3001

### Q: Questions don't appear?
A: Check browser console for errors. Ensure skillsTestData.ts is imported.

### Q: Timer not working?
A: Hard refresh the page (Ctrl+Shift+R)

### Q: Can't submit test?
A: Must answer all 10 questions first. Check unanswered items.

### Q: Certificate not shown?
A: Check you scored >= 70%. Refresh page to see updates.

---

## Next Steps to Customize

### Add More Skills
1. Edit `src/lib/skillsTestData.ts`
2. Add 10 questions for new skill
3. Update `SkillCategory` type in `src/lib/types/skills.ts`
4. Add to `skillsDatabase` array

### Change Pass Score
1. In `skillTests` object: change `passingScore: 70` to desired %
2. Update in multiple tests

### Customize Test Time
1. Change `timeLimit: 30` (in minutes) in skillTests

### Add More Questions Per Test
1. Add more question objects to array
2. Update `totalQuestions` count

### Change Certificate Validity
1. Edit `expiresAt` calculation in `/api/skills/test/route.ts`
2. Currently: 2 years (`2 * 365 * 24 * 60 * 60 * 1000`)

---

## Success Metrics

### System Works Correctly If:
- ✅ Navigation between 3 steps flows smoothly
- ✅ Skills selection shows all available skills
- ✅ Test timer counts down properly
- ✅ Questions answer correctly
- ✅ Score calculation is accurate
- ✅ Certificates generated on passing
- ✅ Certificates NOT generated on failing
- ✅ All answers are reviewable with explanations
- ✅ Retake option works
- ✅ Final confirmation shows all info

---

## Architecture Highlights

### Clean Separation of Concerns
```
Pages (registration flow)
  ↓
Components (UI elements)
  ↓
Services (data handling)
  ↓
API Routes (backend logic)
```

### Reusable Components
- `<SkillsSelection>` - Can be used elsewhere
- `<TestQuestionnaire>` - Generic test engine
- `<SkillsVerificationFlow>` - Can be embedded in other pages

### Type-Safe
- Full TypeScript everywhere
- Zero runtime type errors

### Real-World Questions
- Based on actual professional needs
- Practical scenario-based (not theory-only)
- Explanations teach, not just grade

---

## Performance Notes

### Current Limitations
- In-memory storage (questions & certificates)
- No database persistence yet

### For Production
- Migrate to Firebase Firestore
- Add authentication middleware
- Implement rate limiting on API
- Add admin dashboard for question management
- Enable question versioning

---

## Support

For issues or customizations:
1. Check SKILLS_VERIFICATION_GUIDE.md for detailed docs
2. Review component code for implementation details
3. Check src/lib/skillsTestData.ts for question structure
4. Test API endpoints in browser dev tools
 
---

**Ready to Test:** Visit `http://localhost:3001/register-with-skills` 

Happy Testing! 🚀
