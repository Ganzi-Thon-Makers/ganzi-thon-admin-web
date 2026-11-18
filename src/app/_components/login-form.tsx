'use client';

import {
  type ChangeEvent,
  startTransition,
  type SubmitEvent,
  useActionState,
  useState,
  useTransition,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { loginAction, logoutAction, refreshSessionAction } from '@/lib/auth/actions';
import type { BackofficeRole, LoginFormState } from '@/lib/auth/types';

interface LoginFormProps {
  errorMessage?: string;
}

interface SessionFeedbackState {
  message: string;
  isError: boolean;
}

const INITIAL_LOGIN_FORM_STATE: LoginFormState = {
  status: 'idle',
};

/**
 * 백오피스 관리자 로그인 입력을 처리하는 LoginForm 컴포넌트입니다.
 *
 * 로그인 / 세션 갱신 / 로그아웃 Server Action과 연동해 폼 입력과 인증 완료 화면을 전환합니다.
 */
export function LoginForm({ errorMessage }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dismissedActionError, setDismissedActionError] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [refreshedRole, setRefreshedRole] = useState<BackofficeRole | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedbackState | null>(null);

  const [actionState, formAction, isLoginPending] = useActionState(
    loginAction,
    INITIAL_LOGIN_FORM_STATE,
  );
  const [isSessionPending, startSessionTransition] = useTransition();

  const isPending = isLoginPending || isSessionPending;
  const canLogin = username.trim().length > 0 && password.trim().length > 0;
  const isAuthenticated =
    !loggedOut && actionState.status === 'success' && Boolean(actionState.role);
  const activeRole = refreshedRole ?? actionState.role ?? null;

  const actionErrorMessage =
    !dismissedActionError && actionState.status === 'error' ? actionState.errorMessage : undefined;
  const sessionFormErrorMessage =
    !isAuthenticated && sessionFeedback?.isError ? sessionFeedback.message : undefined;
  const resolvedErrorMessage = actionErrorMessage ?? sessionFormErrorMessage ?? errorMessage;

  /**
   * 아이디 입력값을 갱신하고 이전 서버 오류 표시를 해제한다.
   * @param event 아이디 입력 필드 변경 이벤트 객체
   */
  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setDismissedActionError(true);
    if (!isAuthenticated && sessionFeedback?.isError) {
      setSessionFeedback(null);
    }
  };

  /**
   * 비밀번호 입력값을 갱신하고 이전 서버 오류 표시를 해제한다.
   * @param event 비밀번호 입력 필드 변경 이벤트 객체
   */
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setDismissedActionError(true);
    if (!isAuthenticated && sessionFeedback?.isError) {
      setSessionFeedback(null);
    }
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
    setLoggedOut(false);
    setRefreshedRole(null);
    setSessionFeedback(null);

    /**
     * 수집된 로그인 폼 데이터를 서버 액션으로 전달한다.
     */
    const submitLogin = () => {
      formAction(formData);
    };

    startTransition(submitLogin);
  };

  /**
   * 서버 쿠키의 refreshToken을 사용해 백오피스 인증 토큰 재발급을 요청한다.
   */
  const handleRefreshSession = () => {
    if (isPending) {
      return;
    }

    /**
     * 토큰 재발급 액션을 호출하고 결과에 따라 인증 또는 재로그인 상태를 반영한다.
     */
    const runRefresh = async () => {
      const result = await refreshSessionAction();

      if (result.ok) {
        if (result.role) {
          setRefreshedRole(result.role);
        }
        setSessionFeedback({
          message: '인증 토큰이 갱신되었습니다.',
          isError: false,
        });
        return;
      }

      if (result.errorCode === 'INVALID_REFRESH_TOKEN' || result.errorCode === 'UNAUTHORIZED') {
        setLoggedOut(true);
        setRefreshedRole(null);
        setPassword('');
        setSessionFeedback({
          message: result.errorMessage ?? '유효하지 않은 토큰입니다. 다시 로그인해주세요.',
          isError: true,
        });
        return;
      }

      setSessionFeedback({
        message: result.errorMessage ?? '토큰 재발급에 실패했습니다.',
        isError: true,
      });
    };

    startSessionTransition(runRefresh);
  };

  /**
   * 백오피스 로그아웃 액션을 실행하고 로컬 인증 UI 상태를 초기화한다.
   */
  const handleLogout = () => {
    if (isPending) {
      return;
    }

    /**
     * 로그아웃 액션을 호출하고 폼 입력 상태로 되돌린다.
     */
    const runLogout = async () => {
      const result = await logoutAction();
      setLoggedOut(true);
      setRefreshedRole(null);
      setPassword('');
      setDismissedActionError(true);

      if (!result.ok && result.errorMessage) {
        setSessionFeedback({
          message: `${result.errorMessage} 브라우저 인증 쿠키는 삭제되었습니다.`,
          isError: true,
        });
        return;
      }

      setSessionFeedback(null);
    };

    startSessionTransition(runLogout);
  };

  if (isAuthenticated && activeRole) {
    return (
      <section
        aria-label="관리자 인증 완료"
        role="status"
        className="flex w-full flex-col gap-6 rounded-[8px] border border-gray-700 bg-gray-800 p-6"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-title-sb-20 text-white">관리자 로그인 완료</h1>
            <Badge color="red" size="medium">
              {activeRole}
            </Badge>
          </div>
          <p className="text-body-r-14 text-gray-200">
            <span className="font-semibold text-white">{actionState.loginId ?? username}</span>{' '}
            계정의 인증 토큰이 서버 보안 쿠키에 저장되었습니다.
          </p>
        </div>

        {sessionFeedback ? (
          <p
            role={sessionFeedback.isError ? 'alert' : 'status'}
            className={
              sessionFeedback.isError
                ? 'text-body-r-14 text-red-400'
                : 'text-body-r-14 text-gray-200'
            }
          >
            {sessionFeedback.message}
          </p>
        ) : null}

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button
            disabled={isPending}
            fullWidth
            onClick={handleRefreshSession}
            size="large"
            type="button"
            variant="secondary"
          >
            {isSessionPending ? '처리 중...' : '세션 갱신'}
          </Button>
          <Button
            disabled={isPending}
            fullWidth
            onClick={handleLogout}
            size="large"
            type="button"
            variant="outline"
          >
            로그아웃
          </Button>
        </div>
      </section>
    );
  }

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
