'use client';

import { type ChangeEvent, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionListItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';

export type UserStatusFilter = 'all' | 'yes' | 'no';

export interface UserFiltersProps {
  /** 이름 검색 입력값 */
  searchTerm: string;
  /** 이름 검색 입력값 변경 콜백 */
  onSearchTermChange: (value: string) => void;
  /** 럭키드로우 응모 여부 선택값 */
  luckyDrawFilter: UserStatusFilter;
  /** 럭키드로우 응모 여부 변경 콜백 */
  onLuckyDrawFilterChange: (value: UserStatusFilter) => void;
  /** 수료 여부 선택값 */
  completionFilter: UserStatusFilter;
  /** 수료 여부 변경 콜백 */
  onCompletionFilterChange: (value: UserStatusFilter) => void;
}

/** 검색과 상태 필터를 표시하고 모든 선택 상태를 부모 컴포넌트에 맡깁니다. */
export function UserFilters({
  searchTerm,
  onSearchTermChange,
  luckyDrawFilter,
  onLuckyDrawFilterChange,
  completionFilter,
  onCompletionFilterChange,
}: UserFiltersProps) {
  const [openLuckyDraw, setOpenLuckyDraw] = useState(false);
  const [openCompletion, setOpenCompletion] = useState(false);

  /** 이름 검색 입력 변경값을 부모 컴포넌트에 전달합니다.
   * @param event 검색 입력 변경 이벤트
   */
  function handleSearchTermChange(event: ChangeEvent<HTMLInputElement>) {
    onSearchTermChange(event.target.value);
  }

  /** 응모 필터의 열림 상태를 Accordion 값에 따라 갱신합니다.
   * @param value 현재 열려 있는 Accordion 항목 목록
   */
  function handleLuckyDrawAccordionChange(value: string[]) {
    setOpenLuckyDraw(value.includes('lucky-draw'));
  }

  /** 수료 필터의 열림 상태를 Accordion 값에 따라 갱신합니다.
   * @param value 현재 열려 있는 Accordion 항목 목록
   */
  function handleCompletionAccordionChange(value: string[]) {
    setOpenCompletion(value.includes('completion'));
  }

  /** 응모 옵션 선택을 부모에 전달하고 응모 드롭다운을 닫습니다.
   * @param event 응모 여부 radio 변경 이벤트
   */
  function handleLuckyDrawFilterChange(event: ChangeEvent<HTMLInputElement>) {
    onLuckyDrawFilterChange(event.target.value as UserStatusFilter);
    setOpenLuckyDraw(false);
  }

  /** 수료 옵션 선택을 부모에 전달하고 수료 드롭다운을 닫습니다.
   * @param event 수료 여부 radio 변경 이벤트
   */
  function handleCompletionFilterChange(event: ChangeEvent<HTMLInputElement>) {
    onCompletionFilterChange(event.target.value as UserStatusFilter);
    setOpenCompletion(false);
  }

  /** 럭키드로우 필터를 전체 상태로 초기화합니다. */
  function handleClearLuckyDrawFilter() {
    onLuckyDrawFilterChange('all');
  }

  /** 수료 필터를 전체 상태로 초기화합니다. */
  function handleClearCompletionFilter() {
    onCompletionFilterChange('all');
  }

  return (
    <section aria-label="사용자 검색 및 필터" className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3">
        <TextField
          aria-label="이름 검색"
          placeholder="이름으로 검색하세요."
          value={searchTerm}
          onChange={handleSearchTermChange}
          leadingIcon={<Icon name="search" size={24} label="검색" />}
          containerClassName="w-full min-w-0 sm:w-[480px] sm:max-w-full sm:shrink-0"
          inputWrapperClassName="h-12 rounded-[4px] bg-gray-800"
          className="text-gray-50 placeholder:text-gray-400"
        />

        <Accordion
          value={openLuckyDraw ? ['lucky-draw'] : []}
          onValueChange={handleLuckyDrawAccordionChange}
          className={`relative w-40 max-w-none overflow-visible ${openLuckyDraw ? 'z-30' : 'z-10'}`}
        >
          <AccordionItem value="lucky-draw" className="border-0 bg-transparent">
            <AccordionTrigger
              triggerState="entered"
              className={`h-12 cursor-pointer items-center rounded-[4px] px-4 py-0 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                openLuckyDraw ? 'bg-gray-900 text-gray-400' : 'bg-gray-700 text-gray-50'
              }`}
            >
              응모 여부
            </AccordionTrigger>
            <AccordionContent
              className="absolute top-full left-0 z-50 h-auto w-full overflow-visible"
              contentClassName="gap-0 rounded-md bg-gray-900 px-4 py-2"
            >
              <AccordionListItem className="h-12 border-gray-700 text-gray-100">
                <label className="flex w-full cursor-pointer items-center">
                  <input
                    type="radio"
                    name="lucky-draw-filter"
                    value="yes"
                    checked={luckyDrawFilter === 'yes'}
                    onChange={handleLuckyDrawFilterChange}
                    className="peer sr-only"
                  />
                  <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                    응모 완료
                  </span>
                </label>
              </AccordionListItem>
              <AccordionListItem className="h-12 border-gray-700 text-gray-100">
                <label className="flex w-full cursor-pointer items-center">
                  <input
                    type="radio"
                    name="lucky-draw-filter"
                    value="no"
                    checked={luckyDrawFilter === 'no'}
                    onChange={handleLuckyDrawFilterChange}
                    className="peer sr-only"
                  />
                  <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                    미응모
                  </span>
                </label>
              </AccordionListItem>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion
          value={openCompletion ? ['completion'] : []}
          onValueChange={handleCompletionAccordionChange}
          className={`relative w-40 max-w-none overflow-visible ${openCompletion ? 'z-30' : 'z-10'}`}
        >
          <AccordionItem value="completion" className="border-0 bg-transparent">
            <AccordionTrigger
              triggerState="entered"
              className={`h-12 cursor-pointer items-center rounded-[4px] px-4 py-0 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                openCompletion ? 'bg-gray-900 text-gray-400' : 'bg-gray-700 text-gray-50'
              }`}
            >
              수료 여부
            </AccordionTrigger>
            <AccordionContent
              className="absolute top-full left-0 z-50 h-auto w-full overflow-visible"
              contentClassName="gap-0 rounded-md bg-gray-900 px-4 py-2"
            >
              <AccordionListItem className="h-12 border-gray-700 text-gray-100">
                <label className="flex w-full cursor-pointer items-center">
                  <input
                    type="radio"
                    name="completion-filter"
                    value="yes"
                    checked={completionFilter === 'yes'}
                    onChange={handleCompletionFilterChange}
                    className="peer sr-only"
                  />
                  <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                    수료 완료
                  </span>
                </label>
              </AccordionListItem>
              <AccordionListItem className="h-12 border-gray-700 text-gray-100">
                <label className="flex w-full cursor-pointer items-center">
                  <input
                    type="radio"
                    name="completion-filter"
                    value="no"
                    checked={completionFilter === 'no'}
                    onChange={handleCompletionFilterChange}
                    className="peer sr-only"
                  />
                  <span className="w-full rounded-sm py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-300">
                    미수료
                  </span>
                </label>
              </AccordionListItem>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {luckyDrawFilter !== 'all' || completionFilter !== 'all' ? (
        <div aria-label="적용된 필터" className="flex flex-wrap gap-2">
          {luckyDrawFilter !== 'all' ? (
            <Badge color="red" size="medium" className="h-8 gap-2 px-3 py-0 text-body-sb-14">
              {luckyDrawFilter === 'yes' ? '응모 완료' : '미응모'}
              <button
                type="button"
                onClick={handleClearLuckyDrawFilter}
                aria-label="응모 여부 필터 해제"
                className="flex size-6 cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-static-white"
              >
                <Icon name="delete" size={24} label="해제" />
              </button>
            </Badge>
          ) : null}

          {completionFilter !== 'all' ? (
            <Badge color="red" size="medium" className="h-8 gap-2 px-3 py-0 text-body-sb-14">
              {completionFilter === 'yes' ? '수료 완료' : '미수료'}
              <button
                type="button"
                onClick={handleClearCompletionFilter}
                aria-label="수료 여부 필터 해제"
                className="flex size-6 cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-static-white"
              >
                <Icon name="delete" size={24} label="해제" />
              </button>
            </Badge>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
