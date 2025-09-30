import type { PlasmoCSConfig } from "plasmo"
import candidate from "../data/candidate.json"
import { fillInput, fillInputForRunSmartRecruiters, fillInputForRunSmartRecruitersNextPage, fillTextarea, goToNextOrSubmit, uploadResume, uploadResumeForRunSmartRecruiters } from "~src/utils/formHelper"
import { waitForElement, waitForElementReady } from "../utils/waitForElement"

export const config: PlasmoCSConfig = {
    matches: ["https://*.eightfold.ai/*", "https://*.smartrecruiters.com/*"]
}

// Enhanced dropdown selection function
async function selectDropdownOption(selector: string, value: string, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const dropdown: any = await waitForElement(selector, 5000);
            if (!dropdown) {
                throw new Error(`Dropdown not found: ${selector}`);
            }

            // Check if it's a native select element
            if (dropdown.tagName === 'SELECT') {
                const selectEl = dropdown as HTMLSelectElement;

                // Try exact match first
                let optionFound = false;
                for (let i = 0; i < selectEl.options.length; i++) {
                    const option = selectEl.options[i];
                    if (option.value === value || option.text === value) {
                        selectEl.selectedIndex = i;
                        optionFound = true;
                        break;
                    }
                }

                // Try case-insensitive partial match
                if (!optionFound) {
                    for (let i = 0; i < selectEl.options.length; i++) {
                        const option = selectEl.options[i];
                        if (option.value.toLowerCase().includes(value.toLowerCase()) ||
                            option.text.toLowerCase().includes(value.toLowerCase())) {
                            selectEl.selectedIndex = i;
                            optionFound = true;
                            break;
                        }
                    }
                }

                if (optionFound) {
                    // Trigger change events
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                    selectEl.dispatchEvent(new Event('input', { bubbles: true }));
                    selectEl.dispatchEvent(new Event('blur', { bubbles: true }));
                    console.log(`Selected dropdown ${selector} → ${value}`);
                    return;
                }
            }

            // Handle custom dropdowns (div-based)
            const isCustomDropdown = dropdown.classList.contains('dropdown') ||
                dropdown.getAttribute('role') === 'combobox' ||
                dropdown.querySelector('[role="listbox"]');

            if (isCustomDropdown) {
                // Click to open dropdown
                dropdown.click();
                await new Promise(resolve => setTimeout(resolve, 300));

                // Find the options container
                const optionsContainer = document.querySelector('[role="listbox"]') ||
                    dropdown.querySelector('.dropdown-menu') ||
                    dropdown.querySelector('[class*="option"]')?.parentElement ||
                    dropdown.nextElementSibling;

                if (optionsContainer) {
                    // Find matching option
                    const options = Array.from(optionsContainer.querySelectorAll('[role="option"], .dropdown-item, [class*="option"]'));

                    let matchedOption: Element | null = null;

                    // Try exact match
                    matchedOption = options.find((opt: Element) =>
                        opt.textContent?.trim() === value
                    ) as Element;

                    // Try case-insensitive match
                    if (!matchedOption) {
                        matchedOption = options.find((opt: Element) =>
                            opt.textContent?.trim().toLowerCase() === value.toLowerCase()
                        ) as Element;
                    }

                    // Try partial match
                    if (!matchedOption) {
                        matchedOption = options.find((opt: Element) =>
                            opt.textContent?.trim().toLowerCase().includes(value.toLowerCase())
                        ) as Element;
                    }

                    if (matchedOption) {
                        (matchedOption as HTMLElement).click();
                        await new Promise(resolve => setTimeout(resolve, 200));
                        console.log(`Selected custom dropdown ${selector} → ${value}`);
                        return;
                    }
                }
            }

            // If we get here, try typing the value (for autocomplete dropdowns)
            const input = dropdown.querySelector('input') || dropdown as HTMLInputElement;
            if (input && input.tagName === 'INPUT') {
                input.focus();
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));

                await new Promise(resolve => setTimeout(resolve, 500));

                // Press Enter or click first option
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                console.log(`Typed value in dropdown ${selector} → ${value}`);
                return;
            }

            if (selector.includes("phone-country-code-dropdown")) {
                const input = await waitForElement(selector, 3000) as HTMLInputElement
                if (input) {
                    input.focus()
                    input.value = value
                    input.dispatchEvent(new Event("input", { bubbles: true }))
                    await new Promise(r => setTimeout(r, 300))

                    // simulate Enter to pick the first match
                    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
                    console.log(`Country code set to ${value}`)
                    return
                }
            }


            throw new Error(`Could not select value "${value}" in dropdown ${selector}`);

        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed for ${selector}:`, error);
            if (attempt === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}



async function fillFieldsFromJSON(data: Record<string, any>) {

    const fieldMappings: { [key: string]: { selector: string; type?: string; dependsOn?: string } } = {
        first_name: { selector: "#first-name-input" },
        last_name: { selector: "#last-name-input" },
        middle_name: { selector: `#\\30 -1-additional-questions-text-row` },
        country_code: { selector: "#phone-country-code-dropdown input", type: "dropdown" },
        mobile_num: { selector: "#phone-input" },
        email: { selector: "#postion-apply-input-email" },
        address: { selector: `#\\30 -2-additional-questions-text-row` },
        country: { selector: `#\\30 -4-additional-questions-dropdown`, type: "dropdown" },
        state: { selector: `#\\30 -5-additional-questions-dropdown`, type: "dropdown", dependsOn: "country" },
        city: { selector: `#\\30 -6-additional-questions-text-row` },
        current_company: { selector: `#\\30 -7-additional-questions-text-row` },
        language: { selector: `#\\30 -9-additional-questions-dropdown`, type: "dropdown" },
        heard_about: { selector: `#\\30 -10-additional-questions-dropdown`, type: "dropdown" },
        referred: { selector: `#\\30 -11-additional-questions-dropdown`, type: "dropdown" },
        highest_degree: { selector: `#\\30 -12-additional-questions-dropdown`, type: "dropdown" },
        employed_insight: { selector: `#\\30 -13-additional-questions-dropdown`, type: "dropdown" },
        relocate: { selector: `#\\30 -16-additional-questions-text-row` },
        expected_salary: { selector: `#\\30 -17-additional-questions-text-row` },
        start_working: { selector: `#\\30 -21-additional-questions-dropdown`, type: "dropdown" },
    };

    // Process fields in order, handling dependencies
    const processedFields = new Set<string>();

    for (const key in data) {
        if (key === "resume") continue; // Skip resume - handled separately

        const value = data[key];
        const mapping = fieldMappings[key];

        if (mapping) {
            try {
                // Special handling for country - process it first
                if (key === "country") {
                    if (mapping.type === "dropdown") {
                        await selectDropdownOption(mapping.selector, value);
                        console.log(`Selected dropdown ${key} → ${value}`);
                        processedFields.add(key);

                        // Wait for state dropdown to become available after country selection
                        console.log("⏳ Waiting for state dropdown to load...");
                        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5 seconds

                        // Now process state if it exists in data
                        if (data.state && fieldMappings.state) {
                            const stateElement = await waitForElementReady(fieldMappings.state.selector, 5000);
                            if (stateElement) {
                                await selectDropdownOption(fieldMappings.state.selector, data.state);
                                console.log(`Selected dropdown state → ${data.state}`);
                                processedFields.add("state");
                                // Add delay for city field to be ready
                                await new Promise(resolve => setTimeout(resolve, 500));
                            } else {
                                console.warn("State dropdown not ready after country selection");
                            }
                        }

                        // After the state processing block, explicitly handle city:
                        if (data.city && fieldMappings.city) {
                            const cityElement = await waitForElement(fieldMappings.city.selector, 3000);
                            if (cityElement) {
                                fillInput(fieldMappings.city.selector, data.city);
                                console.log(`Filled city → ${data.city}`);
                            }
                        }
                    }
                    continue;
                }

                // Skip state here since it's processed after country
                if (key === "state") {
                    if (!processedFields.has("state")) {
                        // If state wasn't processed with country, try to process it now
                        if (mapping.type === "dropdown") {
                            const stateElement = await waitForElementReady(mapping.selector, 3000);
                            if (stateElement) {
                                await selectDropdownOption(mapping.selector, value);
                                console.log(`Selected dropdown ${key} → ${value}`);
                            }
                        }
                    }
                    continue;
                }


                // After line where you select employed_insight, add debug logging:
                if (key === "employed_insight") {
                    const dropdown: any = await waitForElement(mapping.selector, 5000);
                    if (dropdown && dropdown.tagName === 'SELECT') {
                        console.log("Available options for employed_insight:");
                        Array.from(dropdown.options).forEach((opt: any) => {
                            console.log(`  - Value: "${opt.value}", Text: "${opt.text}"`);
                        });
                    }
                }
                if (mapping.type === "dropdown") {
                    await selectDropdownOption(mapping.selector, value);
                    console.log(`Selected dropdown ${key} → ${value}`);
                } else {
                    const el = await waitForElement(mapping.selector, 5000);
                    if (el) {
                        if (el.tagName === "TEXTAREA") {
                            fillTextarea(el as any, value);
                        } else {
                            fillInput(mapping.selector, value);
                        }
                        console.log(`Filled ${key} → ${value}`);
                    } else {
                        console.log(`Field not found for selector: ${mapping.selector}`);
                    }
                }
            } catch (error) {
                console.error(`Error filling field ${key} with selector ${mapping.selector}:`, error);
            }
        } else {
            // Fallback: Try to find the field by name, id, placeholder, or label
            try {
                const el: any = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")).find(
                    (input) =>
                        input.name?.toLowerCase().includes(key.toLowerCase()) ||
                        input.id?.toLowerCase().includes(key.toLowerCase()) ||
                        input.placeholder?.toLowerCase().includes(key.toLowerCase()) ||
                        input.closest("label")?.textContent?.toLowerCase().includes(key.toLowerCase())
                );

                if (el) {
                    if (el.tagName === "TEXTAREA") {
                        fillTextarea(el, value);
                    } else {
                        fillInput(el, value);
                    }
                    console.log(`Filled ${key} → ${value} (fallback)`);
                } else {
                    console.log(`Could not find field for key: ${key}`);
                }
            } catch (error) {
                console.error(`Error in fallback filling for ${key}:`, error);
            }
        }
    }

    // Handle field 0-20 (agreement dropdown)
    try {
        await selectDropdownOption(`#\\30 -20-additional-questions-dropdown`, "Yes");
        console.log("Set agreement → Yes");
    } catch (error) {
        console.error("Error setting agreement field:", error);
    }
}

async function handle8foldStep(stepSelector: string, fillFields = true, uploadResumeStep = false) {
    const stepForm = await waitForElement(stepSelector, 15000) // Increased timeout to 15 seconds
    if (!stepForm) {
        console.log(`Step not found: ${stepSelector}`)
        return false
    }

    if (fillFields) await fillFieldsFromJSON(candidate)


    if (uploadResumeStep && candidate.resume) {
        const uploadResumeButton: any = await waitForElement('[data-test-id="upload-resume-browse-button"]')

        if (!uploadResumeButton) {
            console.log("upload resume input not found")
            return false;
        }
        if (uploadResumeButton) {
            // Simulate clicking the browse button to trigger file input
            uploadResumeButton.click()
            console.log("Clicked 'Select file' button")

            // Wait for the file input to appear (assuming it becomes available after click)
            const fileInput = await waitForElement("input[type='file']")
            if (fileInput) {
                await uploadResume("input[type='file']", candidate.resume)

                const uploadResumeSubmitBtn = await waitForElement('button[data-test-id="confirm-upload-resume"]')

                if (uploadResumeSubmitBtn) {

                    (uploadResumeSubmitBtn as HTMLButtonElement).click()
                    console.log("Submit resume button clicked")
                    console.log("Resume uploaded")
                } else {
                    console.log("Submit resume button not found")
                }
            } else {
                console.log("File input not found after clicking 'Select file'")
            }
        } else {
            console.log("'Select file' button not found")
        }
    }

    const submitBtn = stepForm.querySelector<HTMLButtonElement>("button[data-test-id='position-apply-button']")
    if (submitBtn) {
        submitBtn.click()
        console.log("Step submitted")
        return true
    } else {
        console.log("Submit button not found in this step")
        return false
    }
}

async function runEightfold() {
    console.log("🔍 Waiting for Apply Now button...")
    const applyBtn = await waitForElement('button[data-test-id="apply-button"]')
    if (!applyBtn) return
    (applyBtn as HTMLButtonElement).click()
    console.log("Apply Now clicked")

    // Step 1: Wait for resume upload step and handle file selection
    console.log("⏳ Waiting for resume upload step...")
    const resumeUploadStep = await waitForElement('div [data-test-id="upload-resume-browse-button"]') // Target the div containing the button
    if (resumeUploadStep) {
        await handle8foldStep('div [data-test-id="upload-resume-browse-button"]', false, true)
        console.log("Resume upload step submitted")
    } else {
        console.log("Resume upload step not found")
        return
    }

    // Wait for the form step with all fields
    console.log("⏳ Waiting for form step with details...")
    const formStep = await waitForElement("div#careers-apply-form, div.apply-form", 20000);
    await new Promise(res => setTimeout(res, 500))

    if (formStep) {
        await handle8foldStep("div#careers-apply-form, div.apply-form", true)
        console.log("🎉 Application form submitted!")
    } else {
        console.log("Application form step not found")
    }
}
function clickButton(text: string) {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.toLowerCase().includes(text.toLowerCase())
    )
    if (btn) {
        (btn as HTMLButtonElement).click()
        console.log(`✅ Clicked button: ${text}`)
    } else {
        console.log(`❌ Button not found: ${text}`)
    }
}

async function fillCommonFields() {
    await fillInputForRunSmartRecruiters("#first-name-input", candidate.first_name);
    await fillInputForRunSmartRecruiters("#last-name-input", candidate.last_name);
    await fillInputForRunSmartRecruiters("#email-input", candidate.email);
    await fillInputForRunSmartRecruiters("#confirm-email-input", candidate.email);
    await fillInputForRunSmartRecruiters("#spl-form-element_8", candidate.city, 'city');
    await fillInputForRunSmartRecruiters("#spl-form-element_3", candidate.mobile_code, 'mobile_code');
    await fillInputForRunSmartRecruiters("#spl-form-element_3", candidate.mobile_num, 'mobile_num');
    await fillInputForRunSmartRecruiters("#linkedin-input", candidate.linkedin_profile_url);

    // fillInput("input[name='address']", candidate.address)
    // fillInput("input[name='state']", candidate.state)
    // fillInput("input[name='country']", candidate.country)
    // fillInput("input[name='zip']", String(candidate.zip))
    // fillInput("input[name='salary']", String(candidate.expected_salary))
    // fillInput("input[name='availability']", candidate.available_date)

    // Seeker custom responses
    candidate.seeker_response.forEach((resp, idx) => {
        const q = resp.q
        const a = resp.a
        // try to match by placeholder or label text
        const input = Array.from(
            document.querySelectorAll<HTMLInputElement>("input, textarea")
        ).find(
            (el) =>
                el.placeholder?.toLowerCase().includes(q.toLowerCase()) ||
                el.closest("label")?.textContent?.toLowerCase().includes(q.toLowerCase())
        )
        if (input) {
            if (input.tagName === "TEXTAREA") {
                ; (input as unknown as HTMLTextAreaElement).value = a
            } else {
                ; (input as HTMLInputElement).value = a
            }
            input.dispatchEvent(new Event("input", { bubbles: true }))
            console.log(`✅ Filled seeker response: ${q} → ${a}`)
        } else {
            console.log(`❌ Could not find input for seeker response: ${q}`)
        }
    })
}
async function nextPagefillCommonFields() {
    await fillInputForRunSmartRecruitersNextPage("expected_salary", candidate.expected_salary);
    await fillInputForRunSmartRecruitersNextPage("notice_period", candidate.notice_period);
    await fillInputForRunSmartRecruitersNextPage("hybrid_working", candidate.hybrid_working);
    await fillInputForRunSmartRecruitersNextPage("communication_english", candidate.communication_english);
    await fillInputForRunSmartRecruitersNextPage("work_at_job_location", candidate.work_at_job_location);
    await fillInputForRunSmartRecruitersNextPage("checked");
}

async function runSmartRecruiters() {
    clickButton("Apply")

    setTimeout(async () => {
        await fillCommonFields();
        const resp = await uploadResumeForRunSmartRecruiters("oc-resume-upload", candidate.resume, 'runSmartRecruiters');
        console.log(". ~ runSmartRecruiters ~ resp:", resp)
        if (resp) {
            const nextOrSubmit = await goToNextOrSubmit();
            if (nextOrSubmit) {
                setTimeout(async () => {
                    nextOrSubmit.click()
                }, 3000)
                setTimeout(async () => {
                    await nextPagefillCommonFields();
                    const nextOrSubmit1 = await goToNextOrSubmit();
                    if (nextOrSubmit1) {
                        nextOrSubmit1.focus();
                        setTimeout(() => nextOrSubmit1.click(), 4000)
                    }
                }, 5000)
            }
        }
        //setTimeout(() => clickButton("Submit"), 3000)
    }, 2500)
}

window.addEventListener("load", () => {
    console.log("Auto Apply Extension Loaded")
    if (location.href.includes("eightfold.ai")) runEightfold()
    if (location.href.includes("smartrecruiters.com")) runSmartRecruiters()
})