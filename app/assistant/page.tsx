'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { LiveContextPanel } from '@/components/assistant/live-context-panel'
import { Typewriter } from '@/components/assistant/typewriter'
import { ChevronDown, Sparkles, Send, Wheat, Leaf, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shell/page-header'
import { useField } from '@/components/soil/field-provider'
import { useReadings } from '@/lib/soil/use-readings'
import { getProfile, evaluate, PARAMETERS, statusLabel } from '@/lib/soil/thresholds'
import { FARMER } from '@/lib/soil/mock-source'
import type { ParameterKey } from '@/lib/soil/types'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  why?: string
}

const KEYS: ParameterKey[] = ['n', 'p', 'k', 'moisture', 'temperature', 'ph']

function generateAIResponse(question: string, context: {
  crop: string
  soilType: string
  values: Record<ParameterKey, number>
  statuses: Record<ParameterKey, string>
  region: string
}): { content: string, why?: string } {
  const q = question.toLowerCase()
  const { crop, soilType, values, statuses, region } = context

  // Build a context-aware response
  const problemParams = KEYS.filter(k => statuses[k] !== 'good')
  const hasProblems = problemParams.length > 0

  if (q.includes('nitrogen') || q.includes('n level')) {
    const status = statuses.n
    if (status === 'good') {
      return {
        content: `🌱 **Nitrogen Status: Good**\n\nYour nitrogen reading of **${values.n} mg/kg** is within the optimal range for **${crop}** grown on **${soilType}** soil in **${region}**.\n\n*Actual fertilizer recommendations should come from your local Krishi Vigyan Kendra (KVK) or agricultural officer, who can factor in your specific field history, water availability, and planned inputs.*`,
        why: `Your soil currently has adequate nitrogen for healthy vegetative growth and leaf development at this stage. Nitrogen needs change with growth stage. The current reading reflects a snapshot — continue monitoring, especially before top-dressing or after heavy rainfall.`
      }
    }
    return {
      content: `⚠️ **Nitrogen Status: ${statusLabel(status as any)}**\n\nYour nitrogen reading is **${values.n} mg/kg**, which is ${status === 'low' ? 'below' : 'above'} the target range for **${crop}** on **${soilType}** soil.\n\n**Recommendation:**\n1. Get a lab soil test to confirm the sensor reading\n2. Consult your local KVK or agricultural extension officer\n3. Any nitrogen application rate depends on: crop variety, growth stage, soil organic matter, irrigation method, and previous crop residue\n\n*Do not apply a specific dose based solely on this sensor reading.*`,
      why: status === 'low'
        ? 'Low nitrogen can cause pale yellow leaves, stunted growth, and reduced yield. The older (lower) leaves typically show symptoms first. However, sensor readings should be confirmed with a lab soil test before applying fertilizer.'
        : 'Excess nitrogen can cause excessive vegetative growth at the expense of grain/fruit. It can also make crops more susceptible to lodging and certain diseases. Over-application wastes money and can pollute groundwater.'
    }
  }

  if (q.includes('phosphorus') || q.includes('p level')) {
    return {
      content: `🔬 **Phosphorus Analysis**\n\nCurrent reading: **${values.p} mg/kg** (Status: ${statusLabel(statuses.p as any)})\n\nPhosphorus is critical for root development, flowering, and energy transfer in **${crop}**.\n\n**Before acting:** Sensor-measured P can differ from lab-measured "available P" (Olsen method). Consider a lab test for confirmation.\n\n*Your local Soil Testing Laboratory or KVK can provide application rates specific to your crop stage and field history.*`,
      why: `Phosphorus availability is strongly affected by soil pH (your pH: ${values.ph}). In alkaline soils, P gets locked with calcium; in acidic soils, with iron/aluminum. ${soilType} soils have ${soilType.includes('Clay') ? 'high P-fixing capacity — may need higher applications' : soilType.includes('Sandy') ? 'low P retention — split applications work better' : 'moderate P availability characteristics'}.`
    }
  }

  if (q.includes('potassium') || q.includes('k level')) {
    return {
      content: `🧪 **Potassium Analysis**\n\nCurrent reading: **${values.k} mg/kg** (Status: ${statusLabel(statuses.k as any)})\n\nPotassium regulates water use efficiency, disease resistance, and grain/fruit quality in **${crop}**.\n\n*For specific potash (MOP/SOP) recommendations, consult your local agricultural extension service, who can factor in soil test history and cropping pattern.*`,
      why: `K demand is typically highest during reproductive stages. ${soilType.includes('Clay') || soilType.includes('Black') ? 'Clay-rich soils often have good K reserves, but availability varies with moisture' : 'Lighter soils may need more frequent K inputs'}. Adequate K helps the plant cope with water stress and temperature extremes. Your soil temperature (${values.temperature}°C) and moisture (${values.moisture}%) both influence K uptake.`
    }
  }

  if (q.includes('moisture') || q.includes('water') || q.includes('irrigation')) {
    return {
      content: `💧 **Soil Moisture Analysis**\n\nCurrent reading: **${values.moisture}%** (Status: ${statusLabel(statuses.moisture as any)})\n\n**Irrigation guidance:**\n- Check the local weather forecast before irrigating\n- Morning irrigation reduces evaporation losses\n- Mulching can help conserve soil moisture\n- Over-watering reduces oxygen to roots and promotes root diseases\n\n*Optimal irrigation scheduling depends on your specific irrigation method (drip/flood/sprinkler), weather forecast, and crop growth stage.*`,
      why: `${soilType.includes('Clay') || soilType.includes('Black') ? 'Clay soils hold water well but can become waterlogged' : soilType.includes('Sandy') ? 'Sandy soils drain quickly — more frequent, lighter irrigation helps' : 'Loamy soils have good water-holding capacity'}. Current soil temperature (${values.temperature}°C) affects evaporation rate.`
    }
  }

  if (q.includes('ph') || q.includes('acid') || q.includes('alkalin')) {
    return {
      content: `📊 **Soil pH Analysis**\n\nCurrent reading: **${values.ph}** (Status: ${statusLabel(statuses.ph as any)})\n\n**For ${soilType}:**\n${soilType.includes('Black') ? '- Black cotton soils are typically alkaline (7.5–8.5)\n- Gypsum or sulphur amendments may help if pH is consistently high' : soilType.includes('Sandy') ? '- Sandy soils can acidify faster due to leaching\n- Liming may be needed if pH drops below 5.5' : '- Monitor pH trends over multiple readings before deciding on amendments'}\n\n*pH correction is a long-term process. Consult your Soil Testing Lab for lime/gypsum/sulphur recommendations based on buffer pH testing.*`,
      why: `pH controls which nutrients are available to roots. Most crops prefer pH 6.0–7.5. ${values.ph < 6 ? 'Acidic soils: Phosphorus, calcium, and magnesium become less available. Aluminum toxicity risk increases.' : values.ph > 7.5 ? 'Alkaline soils: Iron, zinc, manganese, and boron become less available. May see interveinal chlorosis.' : 'Near-neutral pH: Most nutrients are optimally available.'}`
    }
  }

  if (q.includes('overall') || q.includes('summary') || q.includes('health') || q.includes('report')) {
    const lines = KEYS.map(k => {
      const s = statuses[k]
      const icon = s === 'good' ? '✅' : s === 'critical' ? '🔴' : '⚠️'
      return `${icon} **${PARAMETERS[k].label}:** ${values[k]}${PARAMETERS[k].unit ? ` ${PARAMETERS[k].unit}` : ''} — ${statusLabel(s as any)}`
    })

    return {
      content: `📋 **Soil Health Summary for ${crop} on ${soilType}**\n\n${lines.join('\n')}\n\n${hasProblems
      ? `**Parameters needing attention:** ${problemParams.map(k => PARAMETERS[k].label).join(', ')}\n\nThese readings are outside the recommended range for ${crop} in ${region}. However, single sensor readings should be interpreted cautiously.`
      : `All parameters are within the target range for ${crop} in ${region}. Continue regular monitoring.\n\nRemember: optimal ranges can shift with growth stage. Update the target profile as the crop progresses.`
    }\n\n*For personalized crop management advice, contact your nearest KVK or use the IFFCO Kisan / mKisan helpline.*`,
      why: hasProblems ? `Single sensor readings can be affected by recent weather (heavy rain, dry spell), sensor probe calibration, and recent fertilizer applications. Confirm with a lab soil test for a definitive assessment.` : undefined
    }
  }

  // Default response
  return {
    content: `🌾 **Kisan Sahayak — Your Soil Companion**\n\nI can help you understand your soil readings for **${crop}** growing on **${soilType}** in **${region}**.\n\n**Try asking:**\n- "Explain my nitrogen level"\n- "How is my soil moisture?"\n- "Give me an overall soil health report"\n- "What about my soil pH?"\n- "How is phosphorus for my crop?"\n\n*I do not prescribe exact fertilizer quantities — those depend on many field-specific factors that require expert evaluation.*`,
    why: `My guidance is educational and based on general agronomic principles. For specific fertilizer recommendations, get a proper lab soil test, consult your local Krishi Vigyan Kendra (KVK), use your Soil Health Card recommendations, and consider crop stage, variety, and local conditions.`
  }
}

function AssistantMessage({ msg, isTyping }: { msg: Message; isTyping?: boolean }) {
  const [expanded, setExpanded] = React.useState(false)

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
        {isTyping ? (
          <Typewriter content={msg.content} speed={15} />
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p]:last:mb-0">
            {msg.content.split('\n').map((line, j) => (
              <p key={j} dangerouslySetInnerHTML={{
                __html: line
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }} />
            ))}
          </div>
        )}

        {msg.why && (
          <div className="mt-3 overflow-hidden rounded-xl border bg-background/50 transition-all">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <div className="flex items-center gap-1.5">
                <Leaf className="size-3.5" />
                <span>Agronomic Context</span>
              </div>
              <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
            {expanded && (
              <div className="border-t px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                {msg.why}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AssistantContent() {
  const searchParams = useSearchParams()
  const { field } = useField()
  const { data } = useReadings(field.id, '24H')
  const latest = data!.latest
  const profile = getProfile(field.crop, field.soilType)

  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Build context
  const values = { n: latest.n, p: latest.p, k: latest.k, moisture: latest.moisture, temperature: latest.temperature, ph: latest.ph }
  const statuses = Object.fromEntries(KEYS.map(k => [k, evaluate(latest[k], profile.ranges[k])])) as Record<ParameterKey, string>
  const context = { crop: field.crop, soilType: field.soilType, values, statuses, region: profile.region }

  // Handle initial query from URL
  React.useEffect(() => {
    const q = searchParams.get('q')
    if (q && messages.length === 0) {
      handleSend(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = (text?: string) => {
    const question = text ?? input.trim()
    if (!question) return

    const userMsg: Message = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateAIResponse(question, context)
      setMessages(prev => [...prev, { role: 'assistant', content: response.content, why: response.why }])
      setIsTyping(false)
    }, 600)
  }

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const suggestions = [
    'Give me an overall soil health report',
    'Explain my nitrogen level',
    'How is my soil moisture?',
    'What about soil pH for my crop?',
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Assistant"
        title="Kisan Sahayak"
        description={`Context-aware soil guidance for ${field.name} · ${field.crop} on ${field.soilType}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Sidebar (Top on mobile, Right on desktop) */}
        <div className="order-1 lg:order-2 flex flex-col gap-6">
          <LiveContextPanel latest={latest} profile={profile} />
        </div>

        <div className="order-2 lg:order-1 flex flex-col gap-4">
          {/* Disclaimer */}
          <div className="flex items-start gap-3 rounded-xl border border-status-warn/30 bg-status-warn/8 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-status-warn" />
            <div>
              <p className="font-semibold text-foreground">Educational guidance only</p>
              <p className="mt-1 text-muted-foreground">
                Kisan Sahayak provides general agronomic information based on your sensor data. It does{' '}
                <strong>not</strong> prescribe specific fertilizer doses. Always confirm with a lab soil test and
                consult your local KVK or agricultural extension officer before making input decisions.
              </p>
            </div>
          </div>

          {/* Chat area */}
          <Card className="gap-0 py-0 overflow-hidden">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <CardTitle className="font-display text-base">Kisan Sahayak</CardTitle>
                  <CardDescription>Ask about your soil readings, crop nutrition, or general agronomy</CardDescription>
                </div>
              </div>
            </CardHeader>

            <div ref={scrollRef} className="flex flex-col gap-4 overflow-y-auto p-5" style={{ maxHeight: 480, minHeight: 280 }}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-accent">
                    <Leaf className="size-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold">Namaste, {FARMER.name}!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      I have your latest soil readings for {field.name}. What would you like to know?
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="rounded-full border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <AssistantMessage key={i} msg={msg} isTyping={i === messages.length - 1 && isTyping} />
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3">
                    <span className="size-2 animate-bounce rounded-full bg-primary/40 [animation-delay:0ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary/40 [animation-delay:150ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary/40 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t bg-muted/30 p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your soil readings..."
                  className="flex-1 rounded-full border bg-card px-4 py-2.5 text-sm outline-none ring-ring/50 transition-shadow placeholder:text-muted-foreground focus:ring-2"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading assistant...</div>}>
      <AssistantContent />
    </React.Suspense>
  )
}
