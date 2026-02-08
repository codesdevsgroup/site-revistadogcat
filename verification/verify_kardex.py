from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Navigating to /test-kardex...")
        page.goto("http://localhost:4200/test-kardex", timeout=60000)

        # Wait for the header to be visible
        print("Waiting for header...")
        header = page.get_by_text("Auditoria de Votação (Kardex)")
        expect(header).to_be_visible(timeout=30000)

        # Wait for the form to be visible
        print("Waiting for form...")
        form = page.locator("form")
        expect(form).to_be_visible(timeout=10000)

        # Take a screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/kardex_verification.png", full_page=True)
        print("Screenshot saved to verification/kardex_verification.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_screenshot.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
