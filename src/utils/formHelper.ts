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

