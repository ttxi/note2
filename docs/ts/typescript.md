---
nav:
  title: typescript
  order: 1
---

# typescript

## 1.环境配置和搭建

### 一.什么是 Typescript

TypeScript 是 Javascript 的超集，遵循最新的 ES5/ES6 规范。Typescript 扩展了 Javascript 语法。

- Typescript 更像后端 JAVA,让 JS 可以开发大型企业应用
- TS 提供的类型系统可以帮助我们在写代码时提供丰富的语法提示
- 在编写代码时会对代码进行类型检查从而避免很多线上错误
  > TypeScript 不会取代 JS, 尤雨溪： 我认为将类型添加到 JS 本身是一个漫长的过程 。让委员会设计一个类型系统是（根据 TC39 的经历来判断）不切实际的 。

### 二.环境配置#

#### 1.全局编译 TS 文件#

全局安装 typescript 对 TS 进行编译

```sh
npm install typescript -g
tsc --init # 生成tsconfig.json
```

```sh
tsc # 可以将ts文件编译成js文件
tsc --watch # 监控ts文件变化生成js文件
```

#### 2.配置 webpack 环境#

- 安装依赖

```shell
npm install rollup typescript rollup-plugin-typescript2 @rollup/plugin-node-resolve rollup-plugin-serve -D
```

- 初始化 TS 配置文件

```sh
npx tsc --init
```

- webpack 配置操作

```js
// rollup.config.js
import ts from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import path from 'path';
export default {
  input: 'src/index.ts',
  output: {
    format: 'iife',
    file: path.resolve('dist/bundle.js'),
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts'],
    }),
    ts({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
    serve({
      open: true,
      openPage: '/public/index.html',
      port: 3000,
      contentBase: '',
    }),
  ],
};
```

package.json 配置

```json
"scripts": {
      "dev": "rollup -c -w"
}
```

> 我们可以通过 npm run start 启动服务来使用 typescript 啦~

## 2.基础类型#

TS 中冒号后面的都为类型标识

### 一.布尔、数字、字符串类型

```ts
let bool: boolean = true;
let num: number = 10;
let str: string = 'hello zf';
```

### 二.元组类型

限制长度个数、类型一一对应

```ts
let tuple: [string, number, boolean] = ['zf', 10, true];
// 像元组中增加数据，只能增加元组中存放的类型
tuple.push('回龙观');
```

### 三.数组

声明数组中元素数据类型

```ts
let arr1: number[] = [1, 2, 3];
let arr2: string[] = ['1', '2', '3'];
let arr3: (number | string)[] = [1, '2', 3];
let arr4: Array<number | string> = [1, '2', 3]; // 泛型方式来声明
```

### 四.枚举类型

```ts
enum USER_ROLE {
  USER, // 默认从0开始
  ADMIN,
  MANAGER,
}
// {0: "USER", 1: "ADMIN", 2: "MANAGER", USER: 0, ADMIN: 1, MANAGER: 2}
```

> > 可以枚举，也可以反举

```js
// 编译后的结果
(function (USER_ROLE) {
  USER_ROLE[(USER_ROLE['USER'] = 0)] = 'USER';
  USER_ROLE[(USER_ROLE['ADMIN'] = 1)] = 'ADMIN';
  USER_ROLE[(USER_ROLE['MANAGER'] = 2)] = 'MANAGER';
})(USER_ROLE || (USER_ROLE = {}));
```

异构枚举

```ts
enum USER_ROLE {
  USER = 'user',
  ADMIN = 1,
  MANAGER,
}
```

常量枚举

```ts
const enum USER_ROLE {
  USER,
  ADMIN,
  MANAGER,
}
console.log(USER_ROLE.USER); // console.log(0 /* USER */);
```

### 五.any 类型

不进行类型检测

```ts
let arr: any = ['jiagou', true, { name: 'zf' }];
```

### 六.null 和 undefined

任何类型的子类型,如果 strictNullChecks 的值为 true，则不能把 null 和 undefined 付给其他类型

```ts
let name: number | boolean;
name = null;
```

### 七.void 类型

只能接受 null，undefined。一般用于函数的返回值

```ts
let a: void;
a = undefined;
```

> 严格模式下不能将 null 赋予给 void

### 八.never 类型

任何类型的子类型,never 代表不会出现的值。不能把其他类型赋值给 never

```ts
function error(message: string): never {
  throw new Error('err');
}
function loop(): never {
  while (true) {}
}
function fn(x: number | string) {
  if (typeof x == 'number') {
  } else if (typeof x === 'string') {
  } else {
    console.log(x); // never
  }
}
```

### 九.Symbol 类型

Symbol 表示独一无二

```ts
const s1 = Symbol('key');
const s2 = Symbol('key');
console.log(s1 == s2); // false
```

### 十.BigInt 类型

```ts
const num1 = Number.MAX_SAFE_INTEGER + 1;
const num2 = Number.MAX_SAFE_INTEGER + 2;
console.log(num1 == num2); // true

let max: bigint = BigInt(Number.MAX_SAFE_INTEGER);
console.log(max + BigInt(1) === max + BigInt(2));
```

number 类型和 bigInt 类型是不兼容的

### 十一.object 对象类型

object 表示非原始类型

```ts
let create = (obj: object): void => {};
create({});
create([]);
create(function () {});
```

## 19.扩展全局变量类型

### 一.扩展局部变量

> 可以直接使用接口对已有类型进行扩展

```ts
interface String {
  double(): string;
}
String.prototype.double = function () {
  return (this as string) + this;
};
let str = 'zhufeng';
```

```ts
interface Window {
  mynane: string;
}
console.log(window.mynane);
```

### 二.模块内全局扩展

```ts
declare global {
  interface String {
    double(): string;
  }
  interface Window {
    myname: string;
  }
}
```

> 声明全局表示对全局进行扩展

### 三.声明合并

同一名称的两个独立声明会被合并成一个单一声明，合并后的声明拥有原先两个声明的特性。

#### 1.同名接口合并

```ts
interface Animal {
  name: string;
}
interface Animal {
  age: number;
}
let a: Animal = { name: 'zf', age: 10 };
```

#### 2.命名空间的合并

- 扩展类

```ts
class Form {}
namespace Form {
  export const type = 'form';
}
```

- 扩展方法

```ts
function getName() {}
namespace getName {
  export const type = 'form';
}
```

- 扩展枚举类型

```ts
enum Seasons {
  Spring = 'Spring',
  Summer = 'Summer',
}
namespace Seasons {
  export let Autum = 'Autum';
  export let Winter = 'Winter';
}
```

#### 3.交叉类型合并

```ts
import { createStore, Store } from 'redux';
type StoreWithExt = Store & {
  ext: string;
};
let store: StoreWithExt;
```

### 四.生成声明文件

配置 tsconfig.json 为 true 生成声明文件

```json
"declaration": true
```
