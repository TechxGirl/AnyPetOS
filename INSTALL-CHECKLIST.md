# Installation and Visual QA Checklist

- [ ] Run `npm install lucide-react`
- [ ] Back up the current Sidebar and AppLayout
- [ ] Copy all package files into `src`
- [ ] Confirm App.jsx imports App.css, tokens.css, and ui.css
- [ ] Restart Vite
- [ ] Hard-refresh the browser
- [ ] Confirm the sidebar is approximately 288px wide
- [ ] Confirm navigation is grouped into Overview, Care Management, and Tools
- [ ] Confirm menu icons are line icons rather than emoji
- [ ] Confirm the active page uses a subtle teal highlight and left accent
- [ ] Confirm dashboard text is readable on the dark canvas
- [ ] Confirm modals use the professional X icon
- [ ] Confirm toasts display semantic icons
- [ ] Confirm all buttons have at least a 44px touch target
- [ ] Test the sidebar drawer below 900px browser width
- [ ] Test keyboard focus outlines
- [ ] Test Escape to close mobile navigation and modals
- [ ] Test sign in, pet profile, feeding, weight, shed, medication, edit, share, and delete flows
