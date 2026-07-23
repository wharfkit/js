import type {LoginContext, PromptElement, SessionKeyWhitelistItem} from '@wharfkit/session'
import type {TransactStage, WebUIView} from '../../types.js'

class WebUIState {
    view = $state<WebUIView>('idle')
    active = $state(false)
    minimal = $state(false)

    loginContext = $state<LoginContext | null>(null)

    appName = $state('')

    transactStage = $state<TransactStage>('preparing')
    transactStartTime = $state<number>(0)

    promptTitle = $state('')
    promptBody = $state('')
    promptElements = $state<PromptElement[]>([])

    errorMessage = $state('')
    errorDetails = $state('')

    accountName = $state('')
    chainName = $state('')
    chainLogo = $state('')

    skAppName = $state('')
    skWhitelist = $state<SessionKeyWhitelistItem[]>([])
    skExistingKeyCount = $state(0)
    skAdded = $state<SessionKeyWhitelistItem[]>([])
    skRemoved = $state<SessionKeyWhitelistItem[]>([])

    reset() {
        this.view = 'idle'
        this.active = false
        this.loginContext = null
        this.transactStage = 'preparing'
        this.transactStartTime = 0
        this.promptTitle = ''
        this.promptBody = ''
        this.promptElements = []
        this.errorMessage = ''
        this.errorDetails = ''
        this.skAppName = ''
        this.skWhitelist = []
        this.skExistingKeyCount = 0
        this.skAdded = []
        this.skRemoved = []
    }
}

export const uiState = new WebUIState()
