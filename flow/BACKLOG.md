# 2TIO Flow Backlog

## Kanban Board

### Backlog (To Investigate)

#### Email Confirmation Not Received
- **Issue**: User did not receive confirmation email after order submission
- **Details**: Order confirmation page says "You'll receive confirmation emails within 24 hours" but no email was received
- **Suggested Investigation**:
  - Verify email sending is implemented in 2TIO API
  - Check spam folders
  - Add email delivery status tracking
  - Consider adding "Resend confirmation" button
- **Priority**: High
- **Date Reported**: Dec 4, 2025

#### SMS/Text Confirmation Not Received
- **Issue**: User did not receive text message confirmation
- **Details**: May be related to email issue - need to verify SMS integration exists
- **Suggested Investigation**:
  - Verify SMS sending is implemented
  - Check phone number format validation
  - Add SMS delivery status tracking
- **Priority**: High
- **Date Reported**: Dec 4, 2025

---

### Future Enhancements (Nice to Have)

#### Document Verification
- OCR validation of uploaded documents
- Match name on ID with account holder name
- Verify document is not expired
- Detect photo of photo (fraud prevention)

#### Mobile Phone Verification
- SMS OTP verification during signup
- Verify phone number ownership before order submission

#### Identity Verification Improvements
- SSN format validation (real-time)
- DOB validation (not in future, reasonable age range)
- Integration with identity verification service (e.g., Plaid, Persona)

---

### Completed

#### Document Upload Validation ✅
- **Issue**: 0-byte files accepted as valid identity documents
- **Fix**: Added file size validation to FileUpload component
  - Rejects empty (0-byte) files with "File is empty" error
  - Validates minimum file size (default 1KB)
  - Shows clear error messages for invalid files
- **Date Fixed**: Dec 4, 2025

---

## Notes

- This file tracks feedback and issues discovered during testing
- Items should be moved to "In Progress" when work begins
- Include date and context when adding new items
