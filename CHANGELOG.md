# Changelog

## [1.1.0] - 2025-05-28

### Added
- Secret values are now stored locally in SQLite database
- When editing a secret, the current value is fetched from the local database
- Loading indicator while fetching secret values
- Informational message about local storage vs GitHub encryption

### Changed
- Updated backend API to include GET endpoint for retrieving individual secret values
- Modified frontend to fetch and display stored secret values when editing
- Improved user experience by preserving secret values between edits

### Technical Details
- Added new route: `GET /api/repositories/:owner/:repo/secrets/:name`
- Secret values are stored in the local SQLite database when created/updated
- The frontend now fetches the stored value when opening the edit modal
- Added loading state management for secret value fetching

### Security Note
- Secret values are stored locally in plain text for convenience
- GitHub only receives and stores encrypted values
- Local storage allows users to view and edit their secret values