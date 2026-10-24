# hkamesh476.github.io

Harshan Kamesh's personal site. Plain HTML, CSS and JavaScript, so GitHub Pages serves it as-is with no build step.

Live at **https://hkamesh476.github.io** once this repo is pushed to GitHub as `hkamesh476/hkamesh476.github.io`.

## Updating the site

Everything you'll edit is in `index.html`. Look for the comments in capital letters.

- **Add an award:** find `AWARDS & CERTIFICATIONS`, copy one `<details class="bar">` block, change the text. Put the result (P1, P2, P3, Winner, Award) in `<b class="pos">`.
- **Add a certification:** in the same section, delete the "Certifications are on their way" line and copy the commented-out `<li>` template.
- **Add a project:** copy one `<li>` in the `PROJECTS` list, and add a matching `<img data-key="...">` in the `work-frame` block (same `data-key`).
- **Change your photo:** replace `assets/cricket-bat-ball.jpg` (the small square in "About me") with a square photo of yourself.

Then commit and push. GitHub Pages republishes in about a minute.

## Picture credits

All pictures are openly licensed and credited in the site footer. `assets/credits.json` lists each one with its source and licence.
