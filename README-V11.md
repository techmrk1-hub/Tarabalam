# Bramha.org V11 — Sringeri Sister Design

This package keeps the existing Bramha.org database, Supabase API, verified readers and Tarabalam logic, while replacing the homepage visual system with a closer sister-site rhythm based on the Sringeri.net source material supplied by the project owner.

## Homepage changes
- 27px warm notice strip
- warm cream institutional header
- 13px navigation rhythm and color-coded dropdowns
- seven-color institutional separator line
- large CMS-controlled hero slideshow on an orange traditional background
- three 1175px-wide action cards with 4px colored image rules
- horizontally scrollable announcement cards with the 4px orange scrollbar
- warm date / knowledge strip
- orange institutional banner
- light multi-column footer

## Dynamic hero slides
The slideshow still uses the existing `assets/home-slides.js` setup:
Google Sheet -> Supabase -> public homepage.

It reads public, Verified, Featured rows whose Language is `Homepage Slide` from the existing Articles data flow.

## Upload
Upload the CONTENTS of this folder to the GitHub repository root. Do not place this folder itself inside the repository.

## Important
Do not delete existing root `1.jpg` through `6.jpg` if they are already in GitHub. Tarabalam may reference those existing files.

No Tarabalam calculation logic has been changed.
