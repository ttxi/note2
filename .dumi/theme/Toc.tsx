import React from 'react';

export default ({ slugs }) => {
  if (!slugs?.length) return null;
  return (
    <div
      className="w-full lg:m-12 mb-12 border
      border-gray-200 dark:border-neutral-700 py-4 rounded-lg z-20"
    >
      <p className="text-lg font-extrabold text-gray-800 dark:text-neutral-50 pb-2 border-b border-gray-200 dark:border-neutral-700">
        <span className="px-4">{slugs[0].value}</span>
      </p>
      <ul className="max-h-[calc(100vh-360px)] overflow-y-auto px-4">
        {slugs.map((item: any) => {
          return (
            <li
              key={item.heading}
              style={{ paddingLeft: `${item.depth - 2}rem` }}
              className="mt-3 text-gray-600 cursor-pointer dark:text-neutral-400
              hover:text-blue-500 transition duration-300 dark:hover:text-blue-500"
            >
              <a
                className={`${
                  item.depth > 2 ? 'text-sm' : 'text-base'
                } break-all 2xl:break-words`}
                // href={'#' + getLinkFromTitle(item.title)}
                href={'#' + item.heading}
              >
                {/* {getTocTitle(item.value)} */}
                {item.value}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
