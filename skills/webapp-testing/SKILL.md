---
name: webapp-testing
description: Tests and debugs local web applications with small Python Playwright scripts - start the servers with a helper, wait until the page has rendered, discover selectors from the real DOM, then act, assert, take screenshots and capture browser console logs. Triggered by "test the web app", "check this in a browser", "playwright", "take a screenshot of the page", "the button does nothing", "show the browser console errors".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: test
category: tests/e2e
---

# Web Application Testing

## Goal

Verify frontend functionality, debug UI behaviour, capture screenshots and read browser logs of a local web
application by writing a native Python Playwright script and running it headless. The rendered page - not a
guess from the source code - tells you which selectors exist.

Helper shipped with this skill:

- `scripts/with_server.py` (in this skill's folder) - starts one or more servers, waits until each port accepts
  connections, runs your command, then stops the servers again, even when the command fails. Server output goes to
  `test-results/server-<n>.log`. Run it with `--help` first and use it as a black box; read its source only when you
  really need to customise it.

## Steps

1. **Check the prerequisites.** Python 3 and Playwright for Python must be available:
   `python -c "import playwright"`, and a browser via `python -m playwright install chromium`. If either is
   missing, ask the person before installing anything - adding a dependency is their decision.

2. **Choose the approach:**
   ```
   Task -> Is it static HTML?
       Yes -> Read the HTML file directly to find selectors
              Success -> write a Playwright script using those selectors (file:// URL)
              Fails or incomplete -> treat it as dynamic (below)
       No (dynamic web app) -> Is the server already running?
              No  -> run: python scripts/with_server.py --help
                     then use the helper + a script with only Playwright logic
              Yes -> reconnaissance, then action:
                     1. navigate and wait for networkidle
                     2. take a screenshot or inspect the DOM
                     3. identify selectors from the rendered state
                     4. run the actions with the discovered selectors
   ```

3. **Start the servers with the helper** when they are not running yet. The path is relative to this skill's
   folder; from the project root use the path where the skill lives.

   Single server:
   ```bash
   python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
   ```
   Several servers (for example backend + frontend):
   ```bash
   python scripts/with_server.py \
     --server "cd backend && python server.py" --port 3000 \
     --server "cd frontend && npm run dev" --port 5173 \
     -- python your_automation.py
   ```
   Options: `--timeout` (seconds per server, default 30). The helper exits with your command's exit code.

4. **Write the automation script with Playwright logic only** - the servers are managed for you:
   ```python
   from playwright.sync_api import sync_playwright

   with sync_playwright() as p:
       browser = p.chromium.launch(headless=True)  # always headless
       page = browser.new_page()
       page.goto('http://localhost:5173')          # server is already running and ready
       page.wait_for_load_state('networkidle')     # CRITICAL: wait for the JavaScript to run
       # ... your automation logic
       browser.close()
   ```

5. **Reconnaissance first, then action.** On a dynamic app, never inspect the DOM before the page has
   rendered. Inspect the rendered state, pick selectors from what you actually see, then act:
   ```python
   page.screenshot(path='test-results/inspect.png', full_page=True)
   html = page.content()
   buttons = page.locator('button').all()
   ```
   The element-discovery example below lists buttons, links and inputs in one go.

6. **Turn the run into a check.** A script that only clicks proves nothing. Assert the outcome the user
   would see, so a broken page makes the script exit with an error:
   ```python
   from playwright.sync_api import expect
   page.get_by_role('button', name='Save').click()
   expect(page.get_by_text('Saved')).to_be_visible()
   ```

7. **Capture evidence** when something is wrong: a full-page screenshot before and after the failing step,
   and the browser console plus uncaught page errors (see the console example). Save artefacts under a
   project folder such as `test-results/`, never in an absolute path.

8. **Clean up and report.** Close the browser, let the helper stop the servers, and report what you checked,
   what passed, what failed, with the screenshot and log paths.

## Examples

Discover buttons, links and inputs on a page:
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')

    buttons = page.locator('button').all()
    print(f"Found {len(buttons)} buttons:")
    for i, button in enumerate(buttons):
        text = button.inner_text() if button.is_visible() else "[hidden]"
        print(f"  [{i}] {text}")

    links = page.locator('a[href]').all()
    print(f"\nFound {len(links)} links:")
    for link in links[:5]:
        print(f"  - {link.inner_text().strip()} -> {link.get_attribute('href')}")

    inputs = page.locator('input, textarea, select').all()
    print(f"\nFound {len(inputs)} input fields:")
    for el in inputs:
        name = el.get_attribute('name') or el.get_attribute('id') or "[unnamed]"
        print(f"  - {name} ({el.get_attribute('type') or 'text'})")

    page.screenshot(path='test-results/page_discovery.png', full_page=True)
    browser.close()
```

Static HTML through a `file://` URL (no server needed):
```python
import os
from playwright.sync_api import sync_playwright

file_url = 'file://' + os.path.abspath('path/to/your/file.html')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(file_url)
    page.screenshot(path='test-results/static_page.png', full_page=True)

    page.click('text=Click Me')
    page.fill('#name', 'John Doe')
    page.fill('#email', 'john@example.com')
    page.click('button[type="submit"]')

    page.screenshot(path='test-results/after_submit.png', full_page=True)
    browser.close()
```

Capture console messages and uncaught errors while interacting:
```python
from playwright.sync_api import sync_playwright

url = 'http://localhost:5173'
logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: logs.append(f"[pageerror] {err}"))

    page.goto(url)
    page.wait_for_load_state('networkidle')
    page.click('text=Dashboard')                 # the interaction that triggers the logs
    page.wait_for_load_state('networkidle')
    browser.close()

with open('test-results/console.log', 'w') as f:
    f.write('\n'.join(logs))
print(f"Captured {len(logs)} console messages -> test-results/console.log")
```

Create the folder first (`mkdir -p test-results`) or with `os.makedirs('test-results', exist_ok=True)`.

## Rules

- Wait for `page.wait_for_load_state('networkidle')` before inspecting a dynamic app. If the app keeps a
  connection open (polling, websockets) and networkidle never comes, wait for a specific element instead.
- Prefer waiting for a condition (`page.wait_for_selector(...)`, `expect(...)`) over fixed sleeps;
  use `page.wait_for_timeout()` only for known timed behaviour such as an animation.
- Use descriptive selectors: roles (`get_by_role`), visible text (`text=`), labels, IDs, then CSS.
- Use `sync_playwright()` for synchronous scripts and always close the browser.
- Launch the browser headless.
- Use the bundled helper as a black box for server lifecycle instead of hand-written start/sleep/kill code.

---
Adapted from Web Application Testing by Anthropic, PBC (https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/SKILL.md), Apache-2.0.
Changes: restructured into Goal/Steps, folded the three example scripts in with project-relative output paths, added prerequisite, assertion and console-error steps; scripts/with_server.py now logs server output to test-results/ instead of an unread pipe. See SOURCE.md.
