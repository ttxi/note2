import React, { useContext, Fragment } from 'react';
import { context } from 'dumi/theme';
import SideMenu from 'dumi-theme-default/es/components/SideMenu';
import Navbar from 'dumi-theme-default/es/components/Navbar';
import SearchBar from 'dumi-theme-default/es/components/SearchBar';
import Toc from './Toc';
import './style/tailwind.out.css';

export default (props) => {
  const { meta, base } = useContext(context);

  const isHomePage = meta.__pathname === base;

  return (
    <div
      className="flex flex-col dark:bg-gray-900 min-h-screen transition-all"
      id={isHomePage ? 'home-page' : 'doc-page'}
    >
      <Navbar {...props} navPrefix={<SearchBar />} />

      <div className="g-glossy-firefox-cover" />
      <div className="g-glossy-firefox" id="firefox-head-bg" />

      {isHomePage ? (
        <div id="article-body">{props.children}</div>
      ) : (
        <Fragment>
          <div
            id="article-body"
            className="w-full flex flex-row justify-center overflow-x-hidden"
          >
            {/* 左侧菜单 */}
            <div
              className="fixed left-0 top-0 w-1/4 flex flex-row
          justify-center h-screen z-10 pt-20"
            >
              <div className="container flex flex-row justify-end">
                <div className="hidden lg:block">
                  <SideMenu {...props} />
                </div>
              </div>
            </div>
            {/* 文章内容 */}
            <div className="container flex flex-row justify-center">
              <div className="w-full lg:w-1/2 px-4 lg:px-2 m-8 z-20 lg:pb-12 lg:pt-6">
                <article className="flex-1">{props.children}</article>
              </div>
            </div>
            {/* 右侧 Toc */}
            <div
              className="fixed right-0 top-0 w-1/4 hidden lg:block flex-row
justify-center h-screen z-10 pt-20"
            >
              <div className="container flex flex-row justify-start">
                <div className="w-2/3 top-32">
                  <Toc slugs={meta.slugs} />
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};
