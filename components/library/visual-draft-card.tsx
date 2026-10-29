"use client"

import { useEffect, useState, type CSSProperties } from "react"
import {
  GRADIENT_BUTTON_PRESETS,
  SOLID_BUTTON_PRESETS,
  buttonBackgroundCss,
  createVisualDraftSpec,
  parseVisualDraft,
  serializeVisualDraft,
  type ButtonFill,
  type VisualDraftSpec,
} from "@/lib/library/visual"
import { cn } from "@/lib/utils"

function VisualCanvas({
  spec,
  className,
}: {
  spec: VisualDraftSpec
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex aspect-square w-full flex-col items-center justify-center gap-6 px-6 text-center",
        className
      )}
      style={{ background: spec.background }}
    >
      <p className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {spec.product}
      </p>
      <button
        type="button"
        className="rounded-full px-7 py-3 text-sm font-semibold shadow-sm transition hover:brightness-105 active:translate-y-px"
        style={{
          background: buttonBackgroundCss(spec.button),
          color: spec.buttonTextColor,
        }}
      >
        {spec.cta}
      </button>
    </div>
  )
}

function Swatch({
  active,
  label,
  style,
  onClick,
}: {
  active: boolean
  label: string
  style: CSSProperties
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "size-8 rounded-full border-2 shadow-sm transition",
        active
          ? "border-[var(--rx-ink)] ring-2 ring-[var(--rx-ink)]/20"
          : "border-white/80 hover:scale-105"
      )}
      style={style}
    />
  )
}

export function VisualDraftCard({
  content,
  product,
  cta,
  title,
  editable = false,
  onChange,
  className,
}: {
  content: string
  product?: string
  cta?: string
  title?: string
  editable?: boolean
  onChange?: (serialized: string) => void
  className?: string
}) {
  const [spec, setSpec] = useState<VisualDraftSpec>(
    () =>
      parseVisualDraft(content, { product, cta, title }) ??
      createVisualDraftSpec({
        product: product ?? title ?? "Campaign",
        cta: cta ?? "Learn more",
      })
  )

  useEffect(() => {
    setSpec(
      parseVisualDraft(content, { product, cta, title }) ??
        createVisualDraftSpec({
          product: product ?? title ?? "Campaign",
          cta: cta ?? "Learn more",
        })
    )
  }, [content, product, cta, title])

  function commit(next: VisualDraftSpec) {
    setSpec(next)
    onChange?.(serializeVisualDraft(next))
  }

  function applySolid(color: string, text: string) {
    commit({
      ...spec,
      button: { mode: "solid", color },
      buttonTextColor: text,
    })
  }

  function applyGradient(from: string, to: string, text: string) {
    commit({
      ...spec,
      button: { mode: "gradient", from, to },
      buttonTextColor: text,
    })
  }

  function isSameButton(button: ButtonFill) {
    if (spec.button.mode !== button.mode) return false
    if (button.mode === "solid" && spec.button.mode === "solid") {
      return spec.button.color.toLowerCase() === button.color.toLowerCase()
    }
    if (button.mode === "gradient" && spec.button.mode === "gradient") {
      return (
        spec.button.from.toLowerCase() === button.from.toLowerCase() &&
        spec.button.to.toLowerCase() === button.to.toLowerCase()
      )
    }
    return false
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <VisualCanvas spec={spec} />
      </div>

      {editable ? (
        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Button color
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {SOLID_BUTTON_PRESETS.map((preset) => (
                <Swatch
                  key={preset.label}
                  label={`Solid ${preset.label}`}
                  active={isSameButton({
                    mode: "solid",
                    color: preset.color,
                  })}
                  style={{ background: preset.color }}
                  onClick={() => applySolid(preset.color, preset.text)}
                />
              ))}
              <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                Custom
                <input
                  type="color"
                  aria-label="Custom solid button color"
                  value={
                    spec.button.mode === "solid" ? spec.button.color : "#ffffff"
                  }
                  onChange={(event) =>
                    applySolid(
                      event.target.value,
                      event.target.value.toLowerCase() === "#ffffff"
                        ? "#0f766e"
                        : "#ffffff"
                    )
                  }
                  className="size-8 cursor-pointer rounded-full border border-border/70 bg-transparent p-0"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Button gradient
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {GRADIENT_BUTTON_PRESETS.map((preset) => (
                <Swatch
                  key={preset.label}
                  label={`Gradient ${preset.label}`}
                  active={isSameButton({
                    mode: "gradient",
                    from: preset.from,
                    to: preset.to,
                  })}
                  style={{
                    background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                  }}
                  onClick={() =>
                    applyGradient(preset.from, preset.to, preset.text)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
