import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/button'
import { TextField } from '../../../components/ui/text-field'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { cx } from '../../../utils/cx'
import { checkLoginId, signupMember } from '../api/signup'
import type { SignupRequest } from '../types'
import { EMAIL_PATTERN, getPasswordChecks, PHONE_PATTERN } from '../utils/validation'
import { useDebouncedValue } from '../../../hooks/use-debounced-value'
import './signup-form.css'

type Field = keyof SignupRequest
type FieldErrors = Partial<Record<Field, string>>

const INITIAL_VALUES: SignupRequest = { name: '', email: '', password: '', phone: '' }
const INPUT_CHECK_DELAY_MS = 300
const DUPLICATED_EMAIL_MESSAGE = '이미 가입한 이메일 주소예요.'
const EMAIL_FORMAT_MESSAGE = '이메일 형식이 올바르지 않아요.'
const PHONE_FORMAT_MESSAGE = '전화번호 형식이 올바르지 않아요.'
const PASSWORD_RULES = [
  { key: 'length', label: '최소 8글자 이상' },
  { key: 'charTypes', label: '대문자, 소문자, 숫자, 특수문자 중 3종류 이상' },
] as const

function validate(values: SignupRequest): FieldErrors {
  const errors: FieldErrors = {}
  const passwordChecks = getPasswordChecks(values.password)

  if (!EMAIL_PATTERN.test(values.email)) errors.email = '이메일 형식이 올바르지 않아요.'
  if (!passwordChecks.length || !passwordChecks.charTypes) errors.password = '비밀번호 조건을 확인해 주세요.'
  if (!PHONE_PATTERN.test(values.phone)) errors.phone = '전화번호 형식이 올바르지 않아요.'
  return errors
}

type SignupFormProps = {
  onSuccess: (email: string) => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicatedEmail, setDuplicatedEmail] = useState('')

  const passwordChecks = getPasswordChecks(values.password)
  const isFilled = Object.values(values).every(value => value.trim() !== '')

  function changeField(field: Field, value: string) {
    setValues(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
    setFormError('')
  }

  // 입력이 0.3초 멈췄을 때의 값
  const email = values.email.trim()
  const debouncedEmail = useDebouncedValue(email, INPUT_CHECK_DELAY_MS)
  const debouncedPhone = useDebouncedValue(values.phone, INPUT_CHECK_DELAY_MS)

  // 입력이 멈춘 값이 지금 값과 같을 때만 형식 에러를 보여 줌 (입력 중에는 숨김)
  const emailFormatError =
    debouncedEmail !== '' && debouncedEmail === email && !EMAIL_PATTERN.test(email) ? EMAIL_FORMAT_MESSAGE : undefined
  const phoneFormatError =
    debouncedPhone !== '' && debouncedPhone === values.phone && !PHONE_PATTERN.test(values.phone) ? PHONE_FORMAT_MESSAGE : undefined

  const emailError = errors.email ?? (email !== '' && email === duplicatedEmail ? DUPLICATED_EMAIL_MESSAGE : emailFormatError)
  const phoneError = errors.phone ?? phoneFormatError

  const canSubmit = isFilled && !isSubmitting && !emailError && !phoneError

  // 형식이 맞는 이메일로 입력이 멈추면 중복 확인
  useEffect(() => {
    if (!EMAIL_PATTERN.test(debouncedEmail)) return

    const controller = new AbortController()
    checkLoginId(debouncedEmail, controller.signal)
      .then(({ available }) => {
        if (available === false) setDuplicatedEmail(debouncedEmail)
      })
      .catch(() => {
        // 취소된 요청이나 확인 실패는 무시
      })

    // 이메일이 다시 바뀌면 진행 중인 요청을 취소
    return () => controller.abort()
  }, [debouncedEmail])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    const request: SignupRequest = { ...values, name: values.name.trim(), email: values.email.trim() }
    const fieldErrors = validate(request)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      await signupMember(request)
      onSuccess(request.email)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_DUPLICATED') {
        setDuplicatedEmail(request.email)
      } else {
        setFormError(getErrorMessage(error))
      }
      setIsSubmitting(false)
    }
  }

  return (
    <form className="signup-form" noValidate onSubmit={handleSubmit}>
      <div className="signup-fields">
        <TextField
          label="이름"
          name="name"
          autoComplete="name"
          maxLength={100}
          placeholder="회원가입 할 이름을 입력해 주세요."
          value={values.name}
          error={errors.name}
          onChange={event => changeField('name', event.target.value)}
        />
        <TextField
          label="이메일 주소"
          type="email"
          name="email"
          autoComplete="email"
          maxLength={255}
          placeholder="로그인 시 사용하실 이메일 주소를 입력해 주세요."
          value={values.email}
          error={emailError}
          onChange={event => changeField('email', event.target.value)}
        />
        <div className="signup-password">
          <TextField
            label="비밀번호"
            type="password"
            name="password"
            autoComplete="new-password"
            maxLength={20}
            placeholder="로그인 시 사용하실 비밀번호를 입력해 주세요."
            value={values.password}
            error={errors.password}
            onChange={event => changeField('password', event.target.value)}
          />
          <ul className="signup-password-rules">
            {PASSWORD_RULES.map(rule => (
              <li key={rule.key} className={cx('signup-password-rule', passwordChecks[rule.key] && 'is-valid')}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="m2 6.2 2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {rule.label}
              </li>
            ))}
          </ul>
        </div>
        <TextField
          label="전화번호"
          type="tel"
          name="phone"
          autoComplete="tel-national"
          inputMode="numeric"
          placeholder="- 을 제외하고 전화번호를 입력해 주세요."
          value={values.phone}
          error={phoneError}
          onChange={event => changeField('phone', event.target.value.replace(/\D/g, '').slice(0, 11))}
        />
      </div>

      <div className="signup-bottom">
        {formError && <p className="signup-error" role="alert">{formError}</p>}
        <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
          {isSubmitting ? '가입하는 중...' : '회원가입 완료하기'}
        </Button>
      </div>
    </form>
  )
}