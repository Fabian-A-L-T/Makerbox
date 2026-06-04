import {
  Tabs as RACTabs,
  TabList as RACTabList,
  type TabListProps,
  type TabProps,
  Tab as RACTab,
  type TabsProps,
  TabPanels as RACTabPanels,
  type TabPanelProps,
  TabPanel as RACTabPanel,
  SelectionIndicator,
  type TabPanelsProps
} from 'react-aria-components/Tabs';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';

export function Tabs(props: TabsProps) {
  return <RACTabs {...props} className={`flex flex-col gap-4 w-full ${props.className ?? '' }`}/>;
}

export function TabList<T>(props: TabListProps<T>) {
  return <RACTabList {...props} className={`flex max-w-full overflow-x-auto overflow-y-clip [scrollbar-width:none] border-b-2 border-[var(--color-border)] ${props.className ?? '' }`}/>;
}

export function Tab(props: TabProps) {
  return (
    <RACTab {...props} className={`group relative flex items-center cursor-default px-3 py-1.5 text-sm font-medium transition text-[var(--color-text)]  ${props.className ?? '' }`}>
      {composeRenderProps(props.children, children => (
        <>
          {children}
          <SelectionIndicator className="absolute top-0 left-0 w-full h-full z-10 border-b-4 border-[var(--color-primary)] motion-safe:transition-[translate,width,height]"/>
        </>
      ))}
    </RACTab>
  );
}

export function TabPanels<T>(props: TabPanelsProps<T>) {
  return <RACTabPanels {...props} className={`relative h-(--tab-panel-height) motion-safe:transition-[height] overflow-clip ${props.className ?? '' }`}/>;
}

export function TabPanel(props: TabPanelProps) {
  return <RACTabPanel {...props} className={`flex-1 box-border p-4 text-[var(--color-text)] transition entering:opacity-0 exiting:opacity-0 exiting:absolute exiting:top-0 exiting:left-0 exiting:w-full ${props.className ?? '' }`}/>;
}
