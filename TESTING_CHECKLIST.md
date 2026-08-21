# Frontend Rendering Improvements - Testing Checklist

## Test Scenarios

### 1. Appointment Receipt Display
- [ ] Send a message that triggers appointment booking
- [ ] Verify receipt card appears with:
  - [ ] Confirmation number displayed prominently with "#" prefix
  - [ ] Doctor name and specialty shown
  - [ ] Appointment date in "Month DD, YYYY" format
  - [ ] Appointment time in "H:MM AM/PM" format
  - [ ] Consultation fee with "$" prefix and 2 decimals
  - [ ] Status badge (pending/confirmed/completed/cancelled) with appropriate color
  - [ ] Professional card styling with border and spacing
- [ ] Test different appointment statuses to verify color changes:
  - [ ] Pending → Amber background
  - [ ] Confirmed → Emerald background
  - [ ] Completed → Blue background
  - [ ] Cancelled → Red background

### 2. Available Time Slots Picker
- [ ] Request available appointment slots
- [ ] Verify slot picker displays with:
  - [ ] Doctor name in the header
  - [ ] Date in the header
  - [ ] Time slots in a grid/chip layout
  - [ ] Clock icon next to each time
  - [ ] "No available slots" message when empty
- [ ] Click a time slot button
  - [ ] Verify slot is sent as a message
  - [ ] Verify message appears in chat
  - [ ] Verify backend receives the slot selection

### 3. Clinic Listings
- [ ] Request available clinics
- [ ] Verify clinic cards display with:
  - [ ] Clinic name in card title
  - [ ] Location/address information
  - [ ] Operating hours
  - [ ] Map pin icon
  - [ ] Proper card styling and hover effects
- [ ] Test multiple clinics in grid layout
- [ ] Verify responsive layout on mobile

### 4. Doctor Listings
- [ ] Request available doctors
- [ ] Verify doctor cards display with:
  - [ ] Doctor name in card title
  - [ ] Medical specialty as subtitle
  - [ ] Consultation fee with "$" prefix
  - [ ] Available slots information (if provided)
  - [ ] User icon
  - [ ] Proper card styling and hover effects
- [ ] Test multiple doctors in grid layout
- [ ] Verify responsive layout on mobile

### 5. Service Listings
- [ ] Request available services
- [ ] Verify service cards display with:
  - [ ] Service name in card title
  - [ ] Service price with "$" prefix
  - [ ] Briefcase icon
  - [ ] Proper card styling and hover effects
- [ ] Test multiple services in grid layout
- [ ] Verify responsive layout on mobile

### 6. Message Content Parsing
- [ ] Verify main text content displays before/above structured elements
- [ ] Test with mixed content (text + receipt/slots/lists)
- [ ] Verify graceful fallback to markdown when patterns don't match
- [ ] Test with very long messages
- [ ] Test with special characters in content

### 7. Markdown Still Works
- [ ] Verify regular markdown text still renders correctly
- [ ] Test markdown with headers, bold, italics, lists
- [ ] Verify tables render properly
- [ ] Test code blocks
- [ ] Verify links work correctly

### 8. Sources Display
- [ ] Verify "Clinical Sources & Evidence" button still appears for messages with sources
- [ ] Test expand/collapse functionality
- [ ] Verify source snippets display correctly when expanded
- [ ] Test with multiple sources
- [ ] Verify styling and icons

### 9. Action Buttons
- [ ] Verify "Copy Response" button works for AI messages
- [ ] Verify "Edit Query" button works for user messages
- [ ] Test copying markdown-heavy responses
- [ ] Verify buttons don't interfere with structured elements

### 10. Error States
- [ ] Test error message display (should still work as before)
- [ ] Test rate limit message (should still show warning icon)
- [ ] Verify error messages don't try to parse structured elements
- [ ] Test with empty responses

### 11. Mobile Responsiveness
- [ ] Test receipt card on mobile devices
- [ ] Verify slot picker displays correctly on small screens
- [ ] Test card grids stack properly on mobile
- [ ] Verify touch interactions work (especially slot selection)
- [ ] Check text readability on small screens

### 12. Browser Compatibility
- [ ] Test in Chrome/Edge (Chromium)
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Verify Tailwind CSS classes render correctly in all browsers

### 13. Performance
- [ ] Measure message render time with large responses
- [ ] Test with 50+ appointment slots
- [ ] Test parsing performance with many listing items
- [ ] Verify no memory leaks with repeated messages

### 14. Data Accuracy
- [ ] Verify all data from backend is displayed correctly
- [ ] Test with special characters in names/addresses
- [ ] Verify numbers format correctly (prices, times)
- [ ] Test with very long names or addresses
- [ ] Verify IDs are hidden in UI but available for backend calls

### 15. User Flow Integration
- [ ] Complete full appointment booking flow
- [ ] Verify slot selection integrates with booking process
- [ ] Test list selection (clicking clinics, doctors, services)
- [ ] Verify all selections correctly progress booking

## Edge Cases to Test

- [ ] Empty clinic/doctor/service lists
- [ ] Missing price data
- [ ] Missing doctor specialty
- [ ] Clinic with no operating hours
- [ ] Receipt with status not in standard list
- [ ] Very long names that might wrap
- [ ] Time slots with different formats (24h vs 12h)
- [ ] Multiple spaces or formatting in backend data
- [ ] Internationalization - non-English text

## Performance Metrics to Monitor

- [ ] Page load time with receipt
- [ ] Time to interactive when displaying slots
- [ ] Memory usage with many listings
- [ ] Scroll performance with many messages

## Regression Tests

- [ ] All existing chat features still work
- [ ] Source display and interaction
- [ ] Copy/Edit button functionality
- [ ] Session loading and persistence
- [ ] Message history loading
- [ ] Error handling
- [ ] Rate limiting messages
- [ ] Authentication/logout flow
