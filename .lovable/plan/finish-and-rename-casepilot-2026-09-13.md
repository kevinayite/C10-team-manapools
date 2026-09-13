# Finish and rename CasePilot

## Changes
- Rename SupportSense to CasePilot across navigation, page titles, descriptions, drafted messages, and downloaded filenames.
- Add the missing on-screen confirmation system so save, send, routing, export, and settings actions visibly confirm completion.
- Verify all pages, navigation links, complaint selection, response drafting, routing actions, notifications, filtering, and export behavior.

## Technical details
- Keep the existing FastAPI-ready settings and current routing logic unchanged.
- Mount the existing notification component once at the application root.
- Test representative desktop and mobile flows in the running preview and check for errors.

## GitHub sharing
- No code integration is required. The project can be connected through Lovable’s GitHub project sync after completion.
