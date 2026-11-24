> Illustration only: a shortened example of what this skill produces for a small web app. Not a real project.

# tasks/prd-profile-picture-upload.md

## 1. Introduction / Overview
Users cannot change their profile picture today; everyone shows a grey placeholder. This feature lets a signed-in
user upload a picture on the profile page. Goal: users recognise each other in comments.

## 2. Goals
- A signed-in user can upload, see and replace their own profile picture.
- Uploads under 5 MB finish in under 3 seconds on a normal connection.

## 3. User Stories
- As a signed-in user, I want to upload a picture so that others recognise me in comments.
- As a signed-in user, I want to replace my picture so that it stays current.

## 4. Functional Requirements
1. The system must allow a signed-in user to upload a JPG or PNG file of at most 5 MB on the profile page.
2. The system must reject other file types and larger files with a clear error message and keep the old picture.
3. The system must show the new picture on the profile page and next to the user's comments after upload.
4. The system must crop the picture to a square and store it at 256 × 256 pixels.

## 5. Non-Goals (Out of Scope)
- No picture editing (filters, rotation, manual cropping).
- No pictures for teams or groups.

## 6. Design Considerations
Reuse the existing `Avatar` component; the upload button sits under the avatar on the profile page.

## 7. Technical Considerations
Store files with the existing file storage helper in `src/lib/storage.ts`.

## 8. Success Metrics
- 30% of active users have a picture after one month.

## 9. Open Questions
- Should moderators be able to remove a picture that breaks the community rules?

---

# tasks/tasks-profile-picture-upload.md

## Relevant Files

- `src/pages/profile.tsx` - Profile page; gets the upload button.
- `src/components/AvatarUpload.tsx` - New component with file picker, checks and error message.
- `src/components/AvatarUpload.test.tsx` - Unit tests for `AvatarUpload.tsx`.
- `src/api/avatar.ts` - New API handler that checks, crops and stores the picture.
- `src/api/avatar.test.ts` - Unit tests for `avatar.ts`.

### Notes

- Unit tests sit next to the code they test.
- Run the tests with `npm test -- src/components/AvatarUpload.test.tsx` (all tests: `npm test`).

## Instructions for Completing Tasks

As you complete each task, check it off in this file by changing `- [ ]` to `- [x]`.
Update the file after each sub-task, not only after a whole parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and check out `feature/profile-picture-upload`
- [ ] 1.0 Upload API
  - [x] 1.1 Add `POST /api/avatar` in `src/api/avatar.ts` that accepts one file from a signed-in user
  - [ ] 1.2 Reject files that are not JPG or PNG or are larger than 5 MB (requirement 2), with tests
  - [ ] 1.3 Crop to a square, resize to 256 × 256 and store with `src/lib/storage.ts` (requirement 4), with tests
- [ ] 2.0 Upload component
  - [ ] 2.1 Create `AvatarUpload` with a file picker under the avatar
  - [ ] 2.2 Show the error message from the API and keep the old picture on failure
  - [ ] 2.3 Write tests for success, wrong type and too large
- [ ] 3.0 Show the new picture
  - [ ] 3.1 Refresh the avatar on the profile page after upload
  - [ ] 3.2 Use the stored picture next to comments (requirement 3)
- [ ] 4.0 Final check
  - [ ] 4.1 Run all tests and the linter, fix failures
  - [ ] 4.2 Try the flow by hand: upload, replace, upload a 6 MB file
