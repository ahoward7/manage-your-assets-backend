import type { CredentialResponse } from 'vue3-google-signin'
import nuxtStorage from 'nuxt-storage'
import { defineStore } from 'pinia'

// Initial state
const initialUser: User = {
  email: '',
  firstName: '',
  lastName: '',
  image: '',
}

const initialAccount: Account = {
  user: '',
  client: 'mya',
  firstName: '',
  lastName: '',
  email: '',
  image: '',
  password: '',
}

const initialProfile: Profile = {
  user: '',
  role: '',
  supervisor: '',
  employees: [],
  completed: false,
}

const initialLoginForm: LoginForm = {
  client: 'mya',
  firstName: '',
  lastName: '',
  email: '',
  image: '',
  password: '',
  confirmPassword: '',
}

export const useAuthStore = defineStore('auth', () => {
  const user: Ref<User> = ref({ ...initialUser })
  const account: Ref<Account> = ref({ ...initialAccount })
  const profile: Ref<Profile> = ref({ ...initialProfile })
  const loginForm: Ref<LoginForm> = ref({ ...initialLoginForm })

  const isLoggedIn: Ref<boolean> = ref(false)
  const mode: Ref<AuthMode> = ref('login')
  const googleAccountExistsWithoutMyaAccount: Ref<boolean> = ref(false)
  const noAccountExists: Ref<boolean> = ref(false)
  const accountAlreadyExists: Ref<boolean> = ref(false)
  const passwordsNotMatching: Ref<boolean> = ref(false)
  const invalidPassword: Ref<boolean> = ref(false)

  // API calls
  async function getUserById(userId: string): Promise<User | null> {
    try {
      return await userApi.get({ _id: userId })
    }
    catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  async function getAccountByEmail(email: string): Promise<Account | null> {
    try {
      return await accountApi.get({ email })
    }
    catch (error) {
      console.error('Error fetching account:', error)
      return null
    }
  }

  async function createUserAndAccount(newUser: User, loginInfo: LoginForm | GoogleAccount) {
    try {
      const userWithId = await userApi.post(newUser)
      user.value = userWithId
      account.value = { ...loginInfo, user: userWithId._id || '' }
      await accountApi.post(account.value)
    }
    catch (error) {
      console.error('Error creating user and account:', error)
    }
  }

  // User transformation functions
  function userFromGoogleAccount(googleAccount: GoogleAccount): User {
    return {
      email: googleAccount.email,
      firstName: googleAccount.firstName,
      lastName: googleAccount.lastName,
      image: googleAccount.image || '',
    }
  }

  function userFromAccount(loginInfo: LoginForm): User {
    return {
      email: loginInfo.email,
      firstName: loginInfo.firstName,
      lastName: loginInfo.lastName,
      image: loginInfo.image || '',
    }
  }

  // Handle existing accounts
  async function fillExistingInformation(existingAccount: Account) {
    account.value = existingAccount

    const existingUser = await getUserById(existingAccount.user)
    if (existingUser) {
      user.value = existingUser
      isLoggedIn.value = true
      nuxtStorage.localStorage.setData('mya-auth-account', account.value, 60 * 60 * 24 * 7)
      navigateTo('/')
    }
  }

  // Create new accounts
  async function createAccountFromGoogle(googleAccount: GoogleAccount) {
    const newUser = userFromGoogleAccount(googleAccount)
    await createUserAndAccount(newUser, googleAccount)
  }

  async function createAccount(loginInfo: LoginForm) {
    const newUser = userFromAccount(loginInfo)
    await createUserAndAccount(newUser, loginInfo)
  }

  // Google login
  async function googleLogin(response: CredentialResponse) {
    try {
      const googleAccount: GoogleAccount = accountFromGoogleResponse(response)
      if (!googleAccount.email) {
        console.error('Invalid Google account response')
        return
      }

      const potentialAccount = await getAccountByEmail(googleAccount.email)

      if (potentialAccount) {
        await fillExistingInformation(potentialAccount)
      }
      else {
        const googleAccountWithPassword = { ...googleAccount, password: 'SET_BY_GOOGLE' }
        await createAccountFromGoogle(googleAccountWithPassword)
      }
    }
    catch (error) {
      console.error('Google Login failed:', error)
    }
  }

  function verifyGoogleEmail(response: CredentialResponse) {
    const googleAccount: GoogleAccount = accountFromGoogleResponse(response)
    return googleAccount.email === loginForm.value.email
  }

  // Local login (mya)
  function checkPassword(account: Account, loginInfo: LoginForm | Account) {
    return account.password === loginInfo.password
  }

  function confirmPassword() {
    return loginForm.value.password === loginForm.value.confirmPassword
  }

  function passwordSetByGoogle(account: Account) {
    return account.password === 'SET_BY_GOOGLE'
  }

  function setMyaAccountCreationFromGoogleAccount(account: Account) {
    loginForm.value.firstName = account.firstName
    loginForm.value.lastName = account.lastName
    googleAccountExistsWithoutMyaAccount.value = true
    mode.value = 'google'
  }

  async function patchAccountPassword(account: Account, newPassword: string): Promise<Account | undefined> {
    try {
      return await accountApi.put({ ...account, password: newPassword })
    }
    catch (error) {
      console.error('Error updating account password:', error)
    }
  }

  async function myaLogin(loginInfo: LoginForm) {
    try {
      const potentialAccount = await getAccountByEmail(loginInfo.email)

      if (!potentialAccount) {
        if (mode.value !== 'create') {
          noAccountExists.value = true
          return
        }

        if (!confirmPassword()) {
          passwordsNotMatching.value = true
          return
        }

        await createAccount(loginInfo)
        return
      }

      if (googleAccountExistsWithoutMyaAccount.value) {
        if (!confirmPassword()) {
          passwordsNotMatching.value = true
          return
        }

        const patchedAccount = await patchAccountPassword(potentialAccount, loginInfo.password)

        if (!patchedAccount) {
          console.error('Failed to patch account password')
          return
        }

        await fillExistingInformation(patchedAccount)
        return
      }

      if (mode.value === 'create') {
        accountAlreadyExists.value = true
        return
      }

      if (passwordSetByGoogle(potentialAccount)) {
        setMyaAccountCreationFromGoogleAccount(potentialAccount)
        return
      }

      if (!checkPassword(potentialAccount, loginInfo)) {
        invalidPassword.value = true
        return
      }

      await fillExistingInformation(potentialAccount)
    }
    catch (error) {
      console.error('Mya login failed:', error)
    }
  }

  async function loginFromLocalStorage(accountFromLocalStorage: Account) {
    const existingAccount = await getAccountByEmail(accountFromLocalStorage.email)

    if (!existingAccount || !checkPassword(existingAccount, accountFromLocalStorage)) {
      console.error('Session data corrupted')
      return
    }

    await fillExistingInformation(existingAccount)
  }

  function reset(toUrl?: string) {
    user.value = { ...initialUser }
    account.value = { ...initialAccount }
    profile.value = { ...initialProfile }
    loginForm.value = { ...initialLoginForm }
    isLoggedIn.value = false
    noAccountExists.value = false
    accountAlreadyExists.value = false
    passwordsNotMatching.value = false
    googleAccountExistsWithoutMyaAccount.value = false
    mode.value = 'login'

    if (toUrl)
      navigateTo(toUrl)
  }

  return {
    user,
    account,
    profile,
    loginForm,
    isLoggedIn,
    mode,
    googleAccountExistsWithoutMyaAccount,
    noAccountExists,
    accountAlreadyExists,
    passwordsNotMatching,
    invalidPassword,
    googleLogin,
    verifyGoogleEmail,
    confirmPassword,
    myaLogin,
    loginFromLocalStorage,
    reset,
  }
})
