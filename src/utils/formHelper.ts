export function fillInput(selector: string, value: string) {
    const input = document.querySelector<HTMLInputElement>(selector)
    if (input) {
        input.value = value
        input.dispatchEvent(new Event("input", { bubbles: true }))
        console.log(`Filled ${selector} with: ${value}`)
    } else {
        console.log(`Input not found: ${selector}`)
    }
}
export function fillInputForRunSmartRecruiters(customSelector: string, value: string, inside?: string): Promise<boolean> {
    return new Promise((resolve) => {

        const customEl = document.querySelector(customSelector) as HTMLElement | null;
        if (!customEl) {
            console.log(`❌ Element not found: ${customSelector}`);
            return resolve(false);
        }

        const shadow = (customEl as any).shadowRoot;
        if (!shadow) {
            console.log(`❌ Shadow root not found for: ${customSelector}`);
            return resolve(false);
        }

        // Step 3: find the internal <input>
        let input = shadow.querySelector('input') as HTMLInputElement | null;
        // Step 4: set value and trigger input event
        if (!input && inside === 'city') {
            const shadow1 = (customEl as HTMLElement).shadowRoot;
            if (!shadow1) return null;
            const splInput = shadow1.querySelector('spl-input');
            if (!splInput) return null;
            const shadow2 = (splInput as HTMLElement).shadowRoot;
            if (!shadow2) return null;
            const input = shadow2.querySelector('input');

            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));

                const intervalId = setInterval(() => {
                    const findmenuDiv = splInput.parentElement
                        ?.closest('spl-dropdown')
                        ?.querySelector('#menu-spl-form-element_8');

                    const selectAllinsertSerachValue =
                        findmenuDiv?.querySelectorAll('spl-select-option');

                    if (selectAllinsertSerachValue && selectAllinsertSerachValue.length > 0) {
                        clearInterval(intervalId);
                        (selectAllinsertSerachValue[0]?.shadowRoot?.querySelector('spl-dropdown-item slot spl-truncate') as HTMLElement).click();
                        return resolve(true);
                    }
                }, 500);
                setTimeout(() => {
                    clearInterval(intervalId);
                    console.log("⚠️ Timeout waiting for address dropdown");
                    resolve(false);
                }, 5000);
                return;
            }
        }

        if (!input && inside === 'mobile_code') {
            const shadow1 = (customEl as HTMLElement).shadowRoot?.querySelector('.c-spl-phone-field');
            if (!shadow1) return null;
            const splInput = shadow1?.querySelector('spl-internal-form-field')
            if (!splInput) return null;
            const finalDiv = splInput?.querySelector('div.c-spl-phone-field-content')
            if (inside === "mobile_code") {
                const splitNumberCode = value?.split(" ") // e.g. ["91", "IN"]
                console.log(". ~ fillInput ~ splitNumberCode:", splitNumberCode)
                console.log(". ~ fillInput ~ value:", value)

                const allMobileValues: any = finalDiv?.querySelectorAll(
                    `spl-select-option[value="${splitNumberCode[1]}"]`
                )

                for (const mobileValue of allMobileValues) {
                    // look for the dial code span inside shadowRoot or fallback
                    const removeRoot = (mobileValue as any).shadowRoot
                    const codeSpan =
                        removeRoot?.querySelector(
                            "div.c-spl-phone-field-select-option-container span.c-spl-phone-field-select-option-container-code"
                        ) ||
                        mobileValue.querySelector(
                            "div.c-spl-phone-field-select-option-container span.c-spl-phone-field-select-option-container-code"
                        )

                    const rawValue = codeSpan?.textContent?.trim() || ""
                    const foundValue = rawValue.replace(/^\+/, "") // remove leading "+"

                    if (foundValue === splitNumberCode[0]) {
                        codeSpan?.click()
                            ; (mobileValue as HTMLElement).click()
                        break // stop after finding
                    }
                }
            }
            return resolve(true);
        }

        if (!input && inside === 'mobile_num') {
            const moblieNumDiv = shadow?.querySelector('div div.c-spl-phone-field  spl-internal-form-field div.c-spl-phone-field-content .c-spl-phone-field-input')?.shadowRoot?.querySelector('spl-internal-form-field .c-spl-input-grid .c-spl-input-wrapper')
            const input = moblieNumDiv.querySelector('input');
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return resolve(true);

        }

        if (input) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            console.log(`✅ Filled ${customSelector} with: ${value}`);
            return resolve(true);
        }
        resolve(false);
    });
}

export function fillInputForRunSmartRecruitersNextPage(customSelector: string, value?: string, inside?: string): Promise<boolean> {
    return new Promise((resolve) => {
        const mainDive = document?.querySelector('oc-screening-questions-form div.form-section sr-screening-questions-form')?.shadowRoot?.querySelector('spl-wrapper spl-form')?.querySelectorAll('.spl-mt-2')
        if (customSelector === "expected_salary") {
            const findFisrtMainDiv = mainDive[0]?.querySelector('sr-question-field-currency spl-number-field')?.shadowRoot;
            const input: any = findFisrtMainDiv?.querySelector('div spl-input')?.shadowRoot?.querySelector('spl-internal-form-field .c-spl-input-grid .c-spl-input-wrapper input')
            if (input) {
                input.focus(); // Focus the input like a user would
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));

                // Simulate Enter key press
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));

                console.log(`✅ Filled ${customSelector} with: ${value} and pressed Enter`);
                return resolve(true);
            }
        }
        if (customSelector === "notice_period") {
            const findFisrtMainDiv = mainDive[1]?.querySelector('sr-question-field-text spl-input')?.shadowRoot;
            const input: any = findFisrtMainDiv?.querySelector('div.c-spl-input-grid div.c-spl-input-wrapper input')
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                console.log(`✅ Filled ${customSelector} with: ${value}`);
                return resolve(true);
            }
        }
        if (customSelector === "hybrid_working") {
            const findFisrtMainDiv = mainDive[2]?.querySelector('sr-question-field-select spl-autocomplete')?.shadowRoot?.querySelector('.c-spl-autocomplete-dropdown .c-spl-autocomplete-trigger spl-input')?.shadowRoot;
            const input: any = findFisrtMainDiv?.querySelector('spl-internal-form-field div.c-spl-input-grid .c-spl-input-wrapper input')
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                const intervalId = setInterval(() => {
                    const selectValueAll: any = mainDive[2]?.querySelector('sr-question-field-select spl-autocomplete')?.shadowRoot?.querySelectorAll('.c-spl-autocomplete-dropdown div#menu-question_e6793202-905b-4979-b870-23b8f5ff6226[slot="menu"] spl-select-option');
                    for (const selcteValue of selectValueAll) {
                        const optionEl = selcteValue?.querySelector(
                            '.c-spl-autocomplete-default-option div.c-spl-autocomplete-option-content spl-typography-body'
                        ) as HTMLElement | null

                        const optionText = optionEl?.textContent?.trim()

                        if (optionText?.toLowerCase() === value.toLowerCase()) {
                            optionEl?.click()
                            return resolve(true)
                        }
                    }

                }, 500);
                setTimeout(() => {
                    clearInterval(intervalId);
                    console.log("⚠️ Timeout waiting for address dropdown");
                    resolve(false);
                }, 5000);
                return;

            }
        }
        if (customSelector === "communication_english") {
            const findFisrtMainDiv = mainDive[3]?.querySelector('sr-question-field-select spl-autocomplete')?.shadowRoot?.querySelector('.c-spl-autocomplete-dropdown .c-spl-autocomplete-trigger spl-input')?.shadowRoot;
            const input: any = findFisrtMainDiv?.querySelector('spl-internal-form-field div.c-spl-input-grid .c-spl-input-wrapper input');
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                const intervalId = setInterval(() => {
                    const selectValueAll: any = mainDive[3]?.querySelector('sr-question-field-select spl-autocomplete')?.shadowRoot?.querySelectorAll('.c-spl-autocomplete-dropdown div#menu-question_9d2166a5-5ef3-48b1-8965-4454e91d69ff[slot="menu"] spl-select-option');
                    for (const selcteValue of selectValueAll) {
                        const optionEl = selcteValue?.querySelector(
                            '.c-spl-autocomplete-default-option div.c-spl-autocomplete-option-content spl-typography-body'
                        ) as HTMLElement | null

                        const optionText = optionEl?.textContent?.trim();

                        if (optionText?.toLowerCase()?.includes(value.toLowerCase())) {
                            optionEl?.click()
                            return resolve(true)
                        }
                    }

                }, 500);
                setTimeout(() => {
                    clearInterval(intervalId);
                    console.log("⚠️ Timeout waiting for address dropdown");
                    resolve(false);
                }, 5000);
                return;

            }
        }
        if (customSelector === "work_at_job_location") {
            const targetValue = toTitleCase(value)
            const findFisrtMainDiv: any = mainDive[4]?.querySelectorAll(`sr-question-field-radio spl-radio-group spl-radio[label="${targetValue}"]`);
            console.log(". ~ fillInputForRunSmartRecruitersNextPage ~ findFisrtMainDiv:", findFisrtMainDiv)
            if (findFisrtMainDiv) {
                const input = findFisrtMainDiv[0].shadowRoot?.querySelector('spl-internal-form-field .c-spl-radio input');
                if (input) {
                    input.click();
                    input.checked = true;
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                    resolve(true);
                }
            }
        }
        if (customSelector === "checked") {
            const mainDive = document?.querySelector('oc-consent-decisions')
            const input: any = mainDive?.querySelector('.ng-untouched .spl-flex oc-checkbox spl-checkbox')?.shadowRoot?.querySelector('spl-internal-form-field .c-spl-checkbox-wrapper input');
            if (input) {
                input.click();
                input.dispatchEvent(new Event("change", { bubbles: true }));
                resolve(true);
            }
        }
        resolve(false);
    });
}

function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

export function fillTextarea(selector: string, value: string) {
    const textarea = document.querySelector<HTMLTextAreaElement>(selector)
    if (textarea) {
        textarea.value = value
        textarea.dispatchEvent(new Event("input", { bubbles: true }))
        console.log(`Filled ${selector} with: ${value}`)
    } else {
        console.log(`Textarea not found: ${selector}`)
    }
}

export function uploadResume(selector: string, resumeUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const fileInput = document.querySelector<HTMLInputElement>(selector)
        if (!fileInput) {
            console.log(`File input not found: ${selector}`)
            return reject(`File input not found: ${selector}`)
        }

        fetch(resumeUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], "resume.pdf", { type: "application/pdf" })
                const dt = new DataTransfer()
                dt.items.add(file)
                fileInput.files = dt.files
                fileInput.dispatchEvent(new Event("change", { bubbles: true }))
                console.log(`✅ Uploaded resume from ${resumeUrl}`)

                // Wait a bit for the page to process the file
                setTimeout(() => resolve(), 500)
            })
            .catch((err) => reject(err))
    })
}

export async function uploadResumeForRunSmartRecruiters(selector: string, resumeUrl: string, websiteValue?: string): Promise<boolean> {
    try {
        let fileInput: HTMLInputElement | null = null

        if (websiteValue === 'runSmartRecruiters') {
            const mainDive = document.querySelector<HTMLInputElement>(selector)
            fileInput = mainDive
                ?.querySelector('.form-section')
                ?.querySelector('spl-form-field')
                ?.querySelector('spl-dropzone')
                ?.shadowRoot?.querySelector<HTMLInputElement>(".c-spl-dropzone-wrapper.c-spl-dropzone input[type='file']")
        } else {
            fileInput = document.querySelector<HTMLInputElement>(selector)
        }

        if (!fileInput) {
            console.log(`❌ File input not found: ${selector}`)
            return false
        }

        const res = await fetch(resumeUrl)
        const blob = await res.blob()
        const file = new File([blob], "resume.pdf", { type: "application/pdf" })
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInput.files = dt.files
        fileInput.dispatchEvent(new Event("change", { bubbles: true }))

        console.log(`✅ Uploaded resume from ${resumeUrl}`)
        return true
    } catch (err) {
        console.log("❌ Resume upload failed", err)
        return false
    }
}

export const goToNextOrSubmit = (): HTMLElement | null => {
    const footer = document.querySelector('footer')
    if (!footer) return null

    // Try to find the "Next" button
    const nextBtn = footer
        .querySelector<HTMLElement>('oc-button[data-test="footer-next"] spl-button')
        ?.shadowRoot?.querySelector<HTMLElement>('.c-spl-button-wrapper')

    if (nextBtn) return nextBtn

    // Fallback to "Submit" button
    const submitBtn = footer
        .querySelector<HTMLElement>('oc-button[data-test="footer-submit"] spl-button')
        ?.shadowRoot?.querySelector<HTMLElement>('.c-spl-button-wrapper')

    return submitBtn || null
}

