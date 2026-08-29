# Bramha.org Homepage Slides — Google Sheets CMS

The homepage hero now reads approved slide rows from the existing **Articles** tab in `Bramha.org - Sutra Database`.

## Add a new slide
Create a new row in **Articles** and fill:

- **Article ID**: `SLIDE-001`, `SLIDE-002`, `SLIDE-003` ... (this controls slide order)
- **Title**: main first line
- **Slug**: button destination, e.g. `/dharma-sutra/`
- **Language**: exactly `Homepage Slide`
- **Summary**: description paragraph
- **Content**: highlighted second line
- **Featured Image URL**: image URL
- **Source References**: button text
- **Topic Tags**: image alt text
- **Verification Status**: `Verified`
- **Publish**: `YES`
- **Featured**: `YES`
- **Last Updated**: current date/time

The other columns can remain blank for slides.

## Images
For the simplest workflow:
1. Upload the slide image to Google Drive.
2. Set the file to **Anyone with the link → Viewer**.
3. Paste the Google Drive share URL into **Featured Image URL**.

Normal public HTTPS image URLs also work. Existing website paths such as `/assets/visuals/hero-temple.jpg` also work.

## Automatic update
A normal manual edit in the Articles tab uses the existing installed on-edit sync. Once synced, the homepage automatically reads the new published/verified slide. No GitHub code edit is needed for future slide changes.

Slides autoplay every 7 seconds and also support arrows and dot navigation.
