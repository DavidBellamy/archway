import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  resizeBox,
  type Geometry2d,
  type TLResizeInfo,
  type RecordProps,
} from 'tldraw'
import { GITHUB_CODE_BLOCK_TYPE } from '../../../lib/constants'
import type { GitHubCodeBlockShape } from './GitHubCodeBlockShape'
import { GitHubCodeBlockCard } from './GitHubCodeBlockCard'

export class GitHubCodeBlockShapeUtil extends ShapeUtil<GitHubCodeBlockShape> {
  static override type = GITHUB_CODE_BLOCK_TYPE as string

  static override props: RecordProps<GitHubCodeBlockShape> = {
    w: T.number,
    h: T.number,
    url: T.string,
    owner: T.string,
    repo: T.string,
    ref: T.string,
    filePath: T.string,
    fileName: T.string,
    lineStart: T.number,
    lineEnd: T.number,
    fetchedCode: T.string,
    language: T.string,
    fetchStatus: T.string,
    errorMessage: T.string,
  }

  override getDefaultProps(): GitHubCodeBlockShape['props'] {
    return {
      w: 480,
      h: 200,
      url: '',
      owner: '',
      repo: '',
      ref: '',
      filePath: '',
      fileName: '',
      lineStart: 0,
      lineEnd: 0,
      fetchedCode: '',
      language: 'text',
      fetchStatus: 'idle',
      errorMessage: '',
    }
  }

  override canEdit() {
    return false
  }

  override canBind() {
    return true
  }

  override canResize() {
    return true
  }

  override isAspectRatioLocked() {
    return false
  }

  getGeometry(shape: GitHubCodeBlockShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: GitHubCodeBlockShape, info: TLResizeInfo<GitHubCodeBlockShape>) {
    return resizeBox(shape, info, {
      minWidth: 200,
      minHeight: 80,
    })
  }

  component(shape: GitHubCodeBlockShape) {
    const isDark = this.editor.user.getIsDarkMode()
    const theme = isDark ? 'github-dark' : 'github-light'

    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: 'all',
        }}
      >
        <GitHubCodeBlockCard
          shape={shape}
          theme={theme}
          onOpenPopup={() => {
            // Dispatch a custom event that the popup component listens for
            window.dispatchEvent(
              new CustomEvent('archway:open-popup', {
                detail: { shapeId: shape.id },
              }),
            )
          }}
        />
      </HTMLContainer>
    )
  }

  indicator(shape: GitHubCodeBlockShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={8}
        ry={8}
      />
    )
  }
}
