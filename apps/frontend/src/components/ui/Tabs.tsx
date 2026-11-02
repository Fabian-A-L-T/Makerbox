import { createContext, useContext } from 'react';
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
import { tv } from 'tailwind-variants';

type Orientation = 'horizontal' | 'vertical';
const OrientationContext = createContext<Orientation>('horizontal');

const tabsStyles = tv({
  base: 'flex gap-2',
  variants: {
    orientation: {
      horizontal: 'flex-col',
      vertical: 'flex-row'
    }
  }
});

export function Tabs(props: TabsProps) {
  return (
    <OrientationContext.Provider value={props.orientation ?? 'horizontal'}>
      <RACTabs {...props} className={composeRenderProps(props.className, (className, renderProps) =>
          tabsStyles({...renderProps, className})
      )}/>
    </OrientationContext.Provider>);
}

const tabListStyles = tv({
  base: 'flex gap-4  max-w-full overflow-x-auto overflow-y-clip [scrollbar-width:none]',
  variants: {
    orientation: {
      horizontal: 'flex-row border-b-2 border-[var(--color-border)]',
      vertical: 'flex-col items-start border-r-2 border-[var(--color-border)]'
    }
  }
});

export function TabList<T extends object>(props: TabListProps<T>) {
  return <RACTabList {...props} className={composeRenderProps(props.className, (className, renderProps) =>
        tabListStyles({...renderProps, className})
      )}/>;
}

const tabProps = tv({
  base: 'group relative flex justify-between items-center cursor-default text-sm font-medium transition',
  variants: {
    isDisabled: {
      true: 'opacity-50 cursor-not-allowed',
    },
    isSelected: {
      false: 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
    }
  }
});

export function Tab(props: TabProps) {
  const orientation = useContext(OrientationContext);
  return (
    <RACTab {...props} className={composeRenderProps((props.className || '') + ' ' + (orientation === 'horizontal' ? 'h-full' : 'w-full'), (className, renderProps) =>
          tabProps({...renderProps, className})
        )}>
      {composeRenderProps(props.children, children => (
        <>
        <div className={`flex gap-2 items-center ${orientation === 'horizontal' ? 'py-3' : 'pr-4'} text-lg`}>
          {children}
        </div>
        <SelectionIndicator className={`absolute border-[var(--color-primary)] ${orientation === 'horizontal' ? 'bottom-0 left-0 border-b-4 w-full h-1' : 'top-0 right-0 border-r-4 h-full w-1'} motion-safe:transition-[translate,width,height]`}/>
        </>
      ))}
    </RACTab>
  );
}

export function TabPanels<T extends object>(props: TabPanelsProps<T>) {
  return <RACTabPanels {...props} className={`flex-auto relative h-(--tab-panel-height) motion-safe:transition-[height] overflow-clip ${props.className ?? '' }`}/>;
}

export function TabPanel(props: TabPanelProps) {
  return <RACTabPanel {...props} className={`flex-1 box-border transition entering:opacity-0 exiting:opacity-0 exiting:absolute exiting:top-0 exiting:left-0 exiting:w-full ${props.className ?? '' }`}/>;
}
