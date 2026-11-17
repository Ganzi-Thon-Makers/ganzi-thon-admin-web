import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionListItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const meta = { title: 'Components/Accordion', component: Accordion } satisfies Meta<
  typeof Accordion
>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 닫힌 기본 아코디언 상태를 표시합니다.
 * @returns 기본 아코디언
 */
function renderDefault() {
  return (
    <div className="bg-gray-900 p-8">
      <Accordion>
        <AccordionItem value="default">
          <AccordionTrigger>아코디언 메뉴</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/** 입력된 아코디언 상태를 표시합니다.
 * @returns entered 상태의 아코디언
 */
function renderEntered() {
  return (
    <div className="bg-gray-900 p-8">
      <Accordion>
        <AccordionItem value="entered">
          <AccordionTrigger triggerState="entered">아코디언 메뉴</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/** 목록형 아코디언 상태를 표시합니다.
 * @returns 항목 목록이 펼쳐진 아코디언
 */
function renderList() {
  return (
    <div className="bg-gray-900 p-8">
      <Accordion size="list" defaultValue={['list']}>
        <AccordionItem value="list">
          <AccordionTrigger>아코디언 메뉴</AccordionTrigger>
          <AccordionContent>
            <AccordionListItem>기획</AccordionListItem>
            <AccordionListItem>디자인</AccordionListItem>
            <AccordionListItem>프론트</AccordionListItem>
            <AccordionListItem>서버</AccordionListItem>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/** 정의된 default / entered / list 상태를 표시합니다.
 * @returns 아코디언 상태 갤러리
 */
function renderGallery() {
  return (
    <div className="flex flex-col gap-8 bg-gray-900 p-8">
      <Accordion>
        <AccordionItem value="default">
          <AccordionTrigger>아코디언 메뉴</AccordionTrigger>
        </AccordionItem>
      </Accordion>
      <Accordion>
        <AccordionItem value="entered">
          <AccordionTrigger triggerState="entered">아코디언 메뉴</AccordionTrigger>
        </AccordionItem>
      </Accordion>
      <Accordion size="list" defaultValue={['list']}>
        <AccordionItem value="list">
          <AccordionTrigger>아코디언 메뉴</AccordionTrigger>
          <AccordionContent>
            <AccordionListItem>기획</AccordionListItem>
            <AccordionListItem>디자인</AccordionListItem>
            <AccordionListItem>프론트</AccordionListItem>
            <AccordionListItem>서버</AccordionListItem>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export const Default: Story = { render: renderDefault };
export const Entered: Story = { render: renderEntered };
export const List: Story = { render: renderList };
export const Gallery: Story = { render: renderGallery };
