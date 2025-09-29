import type { PlasmoCSConfig } from "plasmo"

import candidate from "../data/candidate.json"
import { fillInput, fillTextarea, uploadResume } from "~src/utils/formHelper"

export const config: PlasmoCSConfig = {
    matches: [
        "https://*.eightfold.ai/*",
        "https://*.smartrecruiters.com/*"
    ]
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

function fillCommonFields() {
    fillInput("input[name='firstName']", candidate.first_name)
    fillInput("input[name='lastName']", candidate.last_name)
    fillInput("input[name='email']", candidate.email)
    fillInput("input[name='phone']", candidate.mobile_num)
    fillInput("input[name='address']", candidate.address)
    fillInput("input[name='city']", candidate.city)
    fillInput("input[name='state']", candidate.state)
    fillInput("input[name='country']", candidate.country)
    fillInput("input[name='zip']", String(candidate.zip))
    fillInput("input[name='linkedin']", candidate.linkedin_profile_url)
    fillInput("input[name='salary']", String(candidate.expected_salary))
    fillInput("input[name='availability']", candidate.available_date)

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

function runEightfold() {
    clickButton("Apply")

    setTimeout(() => {
        fillCommonFields()
        uploadResume("input[type='file']", candidate.resume)
        setTimeout(() => clickButton("Submit"), 3000)
    }, 2000)
}

function runSmartRecruiters() {
    clickButton("Apply")

    setTimeout(() => {
        fillCommonFields()
        uploadResume("input[type='file']", candidate.resume)
        setTimeout(() => clickButton("Submit"), 3000)
    }, 2000)
}

window.addEventListener("load", () => {
    console.log("🔍 Auto Apply Extension Loaded")
    if (location.href.includes("eightfold.ai")) runEightfold()
    if (location.href.includes("smartrecruiters.com")) runSmartRecruiters()
})
