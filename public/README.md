# Public Assets

This directory contains static assets that are served directly by Next.js.

## Structure

- `/images/` - General images and graphics
- `/icons/` - Icon files (SVG, PNG, etc.)
- `/avatars/` - User avatar images
- `favicon.ico` - Site favicon
- `robots.txt` - Search engine crawling instructions
- `sitemap.xml` - Site structure for search engines

## Usage

Files in this directory are accessible at the root URL of your site:
- `/favicon.ico` → `public/favicon.ico`
- `/images/logo.png` → `public/images/logo.png`
- `/avatars/user.jpg` → `public/avatars/user.jpg`

## Best Practices

- Use appropriate file formats (WebP for images, SVG for icons)
- Optimize images for web use
- Keep file sizes reasonable for fast loading
- Use descriptive filenames
