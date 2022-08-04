/*
 * @Date: 2022-08-04 22:24:15
 * @LastEditTime: 2022-08-04 22:26:26
 * @LastEditors: yuzy
 * @Description: changeLog
 * @Author: yuzy
 */
module.exports = {
    //   skip: {
    //     bump: true, //缓存变化，并重置git状态至最近的tag节点 true-绕过 默认false
    //     changelog: true, //自动产出changelog文档 true-绕过 默认false
    //     commit: true, //提交变动 true - 绕过
    //     tag: true, //在git中增加tag标识 true - 绕过
    //   },
    header: '# SDK更新日志 \n\n',
    types: [
        { type: 'feat', section: '✨ Features | 新功能' },
        { type: 'fix', section: '🐛 Bug Fixes | Bug 修复' },
        { type: 'perf', section: '⚡ Performance Improvements | 性能优化' },
        { type: 'revert', section: '⏪ Reverts | 回退' },
        { type: 'chore', section: '📦 Chores | 其他更新' },
        { type: 'docs', section: '📝 Documentation | 文档' },
        { type: 'style', section: '💄 Styles | 风格' },
        { type: 'refactor', section: '♻️ Code Refactoring | 代码重构' },
        { type: 'test', section: '✅ Tests | 测试' },
        { type: 'build', section: '👷‍ Build System | 构建' },
        { type: 'ci', section: '🔧 Continuous Integration | CI 配置' },
    ],
};