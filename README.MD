\# Quick Quiz Game



A simple signup + timed 3-question game.



\## Live website



\- https://ashwani-mangatram.github.io/New\_Project\_Repo/



\## One-click run options



\### Windows

Double-click `start\_website.bat`.



\### macOS/Linux

Run:



```bash

chmod +x start\_website.sh

./start\_website.sh

```



Both launchers:

\- always serve from this project folder,

\- automatically pick a free port (starting from `4173`),

\- print the exact clickable URL in terminal.



\## Manual run



```bash

python3 launch\_server.py

```



\## Keep GitHub Pages updated



To make changes reflect on the live link, commit and push to the repository branch used by GitHub Pages (usually `main`):



```bash

git add .

git commit -m "Update quiz website"

git push origin main

```



After push, wait around 1-2 minutes and refresh:

\- https://ashwani-mangatram.github.io/New\_Project\_Repo/



\## Troubleshooting



If you see some other page instead of the quiz:

1\. Stop any previous local server (`Ctrl + C`).

2\. Start using `start\_website.bat` or `start\_website.sh` from this repo.

3\. Open the exact URL printed by the launcher (it may use `4174`, `4175`, etc. if `4173` is already busy).



