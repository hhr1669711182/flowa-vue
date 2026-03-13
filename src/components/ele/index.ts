import type { App } from 'vue'
import { Permission } from './Permission'
import { BaseButton } from './Button'

import { UserInfo } from './UserInfo'
import { VideoPlayer } from './VideoPlayer'
import { VideoPlayerViewer } from './VideoPlayerViewer'
import { Waterfall } from './Waterfall'

export const setupGlobCom = (app: App<Element>): void => {
  app.component('Permission', Permission)
  app.component('BaseButton', BaseButton)
  app.component('UserInfo', UserInfo)
  app.component('VideoPlayer', VideoPlayer)
  app.component('VideoPlayerViewer', VideoPlayerViewer)
  app.component('Waterfall', Waterfall)
}
