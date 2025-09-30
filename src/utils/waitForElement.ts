export function waitForElement(
    selector: string,
    timeout = 10000
): Promise<Element | null> {
    return new Promise((resolve) => {
        const interval = 200
        let elapsed = 0

        const check = () => {
            const el = document.querySelector(selector)
            if (el) {
                console.log(`Found element: ${selector}`)
                resolve(el)
            } else if (elapsed >= timeout) {
                console.log(`Timeout waiting for: ${selector}`)
                resolve(null)
            } else {
                elapsed += interval
                setTimeout(check, interval)
            }
        }

        check()
    })
}


export async function waitForElementReady(selector: string, timeout = 5000): Promise<HTMLElement | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element && !element.hasAttribute('disabled') && element.offsetParent !== null) {
            console.log(`Element ready: ${selector}`);
            return element;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.warn(` Element not ready: ${selector}`);
    return null;
}