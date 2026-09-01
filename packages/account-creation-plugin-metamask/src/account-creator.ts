export interface AccountCreationOptions {
    /** Fully built account creation service URL, query string included. */
    url: string
}

export interface AccountCreationPayload {
    /** Name of the account that was created. */
    sa: string
    /** Permission the keys were assigned to, e.g. "active". */
    sp: string
}

export class AccountCreator {
    private popupWindow?: Window
    private origin: string
    private popupStatusInterval?: ReturnType<typeof setInterval>

    constructor(public readonly options: AccountCreationOptions) {
        this.origin = new URL(options.url).origin
    }

    async createAccount(): Promise<AccountCreationPayload> {
        this.popupWindow = window.open(
            this.options.url,
            'targetWindow',
            `toolbar=no,
            location=no,
            status=no,
            menubar=no,
            scrollbars=yes,
            resizable=yes,
            width=400,
            height=600`
        )!

        return new Promise((resolve, reject) => {
            const finish = (complete: () => void) => {
                window.removeEventListener('message', listener)
                this.closeDialog()
                complete()
            }
            const listener = (event: MessageEvent) => {
                if (event.origin !== this.origin) {
                    return
                }
                if (event.data?.error) {
                    finish(() => reject(new Error(event.data.error)))
                } else if (event.data?.sa && event.data?.sp) {
                    finish(() => resolve(event.data))
                }
            }
            window.addEventListener('message', listener)

            this.popupStatusInterval = setInterval(() => {
                if (this.popupWindow && this.popupWindow.closed) {
                    finish(() => reject(new Error('Popup window closed')))
                }
            }, 500)
        })
    }

    closeDialog() {
        this.popupWindow?.close()

        this.cleanup()
    }

    cleanup() {
        if (this.popupStatusInterval) {
            clearInterval(this.popupStatusInterval)
        }
        this.popupStatusInterval = undefined
        this.popupWindow = undefined
    }
}
