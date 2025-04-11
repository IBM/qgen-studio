import { usePathname } from 'next/navigation';
import {
    Header,
    HeaderContainer,
    HeaderName,
    HeaderNavigation,
    HeaderMenuButton,
    HeaderMenuItem,
    HeaderGlobalBar,
    HeaderGlobalAction,
    SkipToContent,
    SideNav,
    SideNavItems,
    SideNavLink,
    HeaderSideNavItems,
    OverflowMenu,
    Tag
} from '@carbon/react';
import { Switcher, Notification, UserAvatar, Fade, Menu, CloseLarge, Forum, IbmCloudProjects, Search, Light, Asleep, AsleepFilled, CircleDash, CheckmarkFilled, DocumentMultiple_01, ModelTuned, SearchLocate, Upload, PromptTemplate, QuestionAnswering, VolumeFileStorage } from '@carbon/icons-react';
import { useEffect, useState } from 'react';
  
export default function Shell({ theme, onToggleTheme }) { 
    const path = usePathname();

    return (
        <HeaderContainer
            render={({ isSideNavExpanded, onClickSideNavExpand }) => (
                <Header aria-label="QGen Studio">
                    <SkipToContent />
                    <HeaderName href="/" prefix="IBM">
                        QGen Studio
                    </HeaderName>
                    {path=='/'? <></> : 
                    <>
                        <SideNav
                            aria-label="Side navigation"
                            isPersistent={true}
                            expanded={true}
                            addFocusListeners={false} addMouseListeners={false}
                        >
                            <SideNavItems>
                                <SideNavLink large renderIcon={VolumeFileStorage} isActive={path=="/doc_groups"} href={"/doc_groups"}>
                                    Documents
                                </SideNavLink>
                                <SideNavLink large renderIcon={PromptTemplate} isActive={path=="/prompts"} href={"/prompts"}>
                                    Example Prompts
                                </SideNavLink>
                                <SideNavLink large renderIcon={DocumentMultiple_01} isActive={path=="/generation"} href={"/generation"}>
                                    Dataset Generation
                                    {/* 3. Dataset Viewer<br/>
                                    <span style={{fontSize: "smaller"}}>optional</span> */}
                                </SideNavLink>
                                <SideNavLink large renderIcon={SearchLocate} isActive={path=="/datasets"} href={"/datasets"}>
                                    Dataset Viewer
                                    {/* 3. Dataset Viewer<br/>
                                    <span style={{fontSize: "smaller"}}>optional</span> */}
                                </SideNavLink>
                                <SideNavLink large renderIcon={ModelTuned} isActive={path=="/training"} href={"/training"}>
                                    Model Finetuning
                                    {/* 4. Train & Test<br/>
                                    <span style={{fontSize: "smaller"}}>optional</span> */}
                                </SideNavLink>
                                <SideNavLink large renderIcon={QuestionAnswering} isActive={path=="/explorer"} href={"/explorer"}>
                                    Model Explorer
                                    {/* 4. Train & Test<br/>
                                    <span style={{fontSize: "smaller"}}>optional</span> */}
                                </SideNavLink>
                            </SideNavItems>
                        </SideNav>
                    </>}
                    <HeaderGlobalBar>
                        <HeaderGlobalAction aria-label="theme">
                            {theme == 'light'? 
                                <Asleep size={20} onClick={onToggleTheme} /> : 
                                <Light size={20} onClick={onToggleTheme} />}
                        </HeaderGlobalAction>
                    </HeaderGlobalBar>
                </Header>
            )}
        />
);
}