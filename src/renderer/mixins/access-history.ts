import { Vue, Component } from 'vue-property-decorator'
import { Entities } from '../database'

@Component
export default class AccessHistory extends Vue {
    public updateHistory(href: string, extra?: { title?: string, favicon?: string }) {
        GDB.transaction('rw', GDB.history, async () => {
            const entity = await GDB.history.get(href)
            if (entity) {
                const update = {} as Entities.History
                update.lastAccessTime = Date.now()
                update.accessCount = entity.accessCount + 1
                if (extra) {
                    if (extra.favicon && entity.favicon !== extra.favicon) {
                        update.favicon = extra.favicon
                    }
                    if (extra.title && entity.title !== extra.title) {
                        const tokens = new Set<string>()
                        tokenizeHref(href).forEach(t => tokens.add(t))
                        tokenizeTitle(extra.title).forEach(t => tokens.add(t))
                        update.tokens = [...tokens]
                    }
                }
                await GDB.history.update(href, update)
            } else {
                const tokens = new Set<string>()
                tokenizeHref(href).forEach(t => tokens.add(t))
                if (extra && extra.title) {
                    tokenizeTitle(extra.title).forEach(t => tokens.add(t))
                }
                await GDB.history.add({
                    href,
                    lastAccessTime: Date.now(),
                    accessCount: 1,
                    favicon: extra ? (extra.favicon || '') : '',
                    title: extra ? (extra.title || '') : '',
                    tokens: [...tokens]
                })
            }
            // tslint:disable-next-line:no-console
        }).catch(console.warn)
    }

    public async queryHistory(keyword: string) {
        keyword = keyword.split(' ').filter(p => !!p).join(' ')
        let items = await GDB.history
            .where('tokens')
            .startsWithIgnoreCase(keyword)
            .distinct()
            .toArray()

        if (items.length > 0 || keyword.length < 8) {
            return items
        }
        items = await GDB.history
            .where('href')
            .startsWith(keyword)
            .toArray()
        return items
    }
}

function tokenizeTitle(title: string) {
    const parts = title.split(' ').filter(p => p && p.length > 1)
    const tokens = []
    for (let i = 0; i < parts.length; i++) {
        tokens.push(parts.slice(i).join(' '))
    }
    return tokens
}

import * as UrlUtils from '@/common/url-utils'

function tokenizeHref(href: string) {
    const hostname = UrlUtils.hostnameOf(href)
    const parts = hostname.split('.')

    const tokens = []
    for (let i = 0; i < parts.length - 1; i++) {
        tokens.push(parts.slice(i).join('.'))
    }
    return tokens
}
