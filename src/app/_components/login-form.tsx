'use client';

import {
  type ChangeEvent,
  startTransition,
  type SubmitEvent,
  useActionState,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { loginAction } from '@/lib/auth/actions';
import type { LoginFormState } from '@/lib/auth/types';

interface LoginFormProps {
  errorMessage?: string;
}

const INITIAL_LOGIN_FORM_STATE: LoginFormState = {
  status: 'idle',
};

/**
 * 백오피스 관리자 로그인 입력을 처리하는 LoginForm 컴포넌트입니다.
 *
 * 로그인 Server Action과 연동해 관리자 로그인 입력과 오류 메시지를 표시합니다.
 */
export function LoginForm({ errorMessage }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dismissedActionError, setDismissedActionError] = useState(false);

  const [actionState, formAction, isLoginPending] = useActionState(
    loginAction,
    INITIAL_LOGIN_FORM_STATE,
  );

  const isPending = isLoginPending;
  const canLogin = username.trim().length > 0 && password.trim().length > 0;

  const actionErrorMessage =
    !dismissedActionError && actionState.status === 'error' ? actionState.errorMessage : undefined;
  const resolvedErrorMessage = actionErrorMessage ?? errorMessage;

  /**
   * 아이디 입력값을 갱신하고 이전 서버 오류 표시를 해제한다.
   * @param event 아이디 입력 필드 변경 이벤트 객체
   */
  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setDismissedActionError(true);
  };

  /**
   * 비밀번호 입력값을 갱신하고 이전 서버 오류 표시를 해제한다.
   * @param event 비밀번호 입력 필드 변경 이벤트 객체
   */
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setDismissedActionError(true);
  };

  /**
   * 폼 기본 제출 동작을 방지하고 로그인 Server Action을 전환 상태로 실행한다.
   * @param event 로그인 폼 제출 이벤트 객체
   */
  const handleFormSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canLogin || isPending) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setDismissedActionError(false);

    /**
     * 수집된 로그인 폼 데이터를 서버 액션으로 전달한다.
     */
    const submitLogin = () => {
      formAction(formData);
    };

    startTransition(submitLogin);
  };

  return (
    <form
      aria-label="관리자 로그인"
      className="flex w-full flex-col gap-6"
      noValidate
      onSubmit={handleFormSubmit}
    >
      <div className="flex w-full flex-col gap-4">
        <TextField
          autoComplete="username"
          containerClassName="w-full"
          disabled={isPending}
          inputWrapperClassName="bg-gray-800"
          isError={Boolean(resolvedErrorMessage)}
          label="아이디"
          name="loginId"
          onChange={handleUsernameChange}
          placeholder="example@email.com"
          value={username}
        />
        <div className="flex w-full flex-col gap-1">
          <TextField
            aria-describedby={resolvedErrorMessage ? 'password-error-message' : undefined}
            autoComplete="current-password"
            containerClassName="w-full"
            disabled={isPending}
            inputWrapperClassName="bg-gray-800"
            isError={Boolean(resolvedErrorMessage)}
            label="비밀번호"
            name="password"
            onChange={handlePasswordChange}
            placeholder="password"
            type="password"
            value={password}
          />
          <div
            id="password-error-message"
            role="alert"
            className="min-h-6 text-body-r-16 leading-6 font-normal text-red-500"
          >
            {resolvedErrorMessage}
          </div>
        </div>
      </div>

      <Button disabled={!canLogin || isPending} fullWidth size="large" type="submit">
        {isLoginPending ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
