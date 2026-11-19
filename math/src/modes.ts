import { GameMode, ResultSet, SPIN_TYPE, defineGameModes, defineUserState } from "@slot-engine/core"
import { REELS } from "./reels"
import { REELS_AMOUNT, ROWS } from "./constants"
import type { FlowUserData } from "./flow"

export const RTP = 0.962

export const userState = defineUserState({
  fsType: "" as string,
  outcome: "" as string,
})
export type UserStateType = typeof userState

const reelWeights = {
  [SPIN_TYPE.BASE_GAME]: { base: 1 },
  [SPIN_TYPE.FREE_SPINS]: { fs: 1 },
}

const reelSets = [...Object.values(REELS)]
const board = { reelsAmount: REELS_AMOUNT, symbolsPerReel: Array(REELS_AMOUNT).fill(ROWS) as number[] }

function rs(opts: {
  criteria: string
  quota: number
  userData?: FlowUserData
  multiplier?: number
  forceMaxWin?: boolean
  fs?: string
}) {
  const { fs, ...rest } = opts
  return new ResultSet<UserStateType>({
    ...rest,
    reelWeights,
    forceFreespins: !!fs,
    evaluate: fs ? (ctx) => ctx.state.userData.fsType === fs : (ctx) => ctx.state.userData.fsType === "",
  })
}

/** Result sets shared by base and Naughty List Ante. */
function baseLikeResultSets() {
  return [
    rs({ criteria: "0", quota: 0.45, multiplier: 0, userData: { trigger: "none" } }),
    rs({ criteria: "basegame", quota: 0.4, userData: { trigger: "none" } }),
    rs({ criteria: "bonus", quota: 0.08, fs: "bonus", userData: { trigger: "bonus" } }),
    rs({ criteria: "super", quota: 0.04, fs: "super", userData: { trigger: "super" } }),
    rs({ criteria: "hidden", quota: 0.02, fs: "hidden", userData: { trigger: "hidden" } }),
    rs({ criteria: "maxwin", quota: 0.004, fs: "hidden", forceMaxWin: true, userData: { trigger: "hidden", boost: true } }),
  ]
}

/** Result sets for the always-Sleigh-Run feature-spin modes. */
function featureSpinResultSets(zeroQuota: number) {
  return [
    rs({ criteria: "0", quota: zeroQuota, multiplier: 0 }),
    rs({ criteria: "feature", quota: 1 - zeroQuota }),
    rs({ criteria: "maxwin", quota: 0.004, forceMaxWin: true, userData: { boost: true } }),
  ]
}

export const gameModes = defineGameModes({
  base: new GameMode({
    name: "base",
    cost: 1,
    rtp: RTP,
    ...board,
    reelSets,
    resultSets: baseLikeResultSets(),
  }),
  ante: new GameMode({
    name: "ante",
    cost: 3,
    rtp: RTP,
    ...board,
    isFeature: true,
    reelSets,
    resultSets: baseLikeResultSets(),
  }),
  mini: new GameMode({
    name: "mini",
    cost: 100,
    rtp: RTP,
    ...board,
    isFeature: true,
    reelSets,
    resultSets: featureSpinResultSets(0.1),
  }),
  mega: new GameMode({
    name: "mega",
    cost: 1000,
    rtp: RTP,
    ...board,
    isFeature: true,
    reelSets,
    resultSets: featureSpinResultSets(0.02),
  }),
  bonus: new GameMode({
    name: "bonus",
    cost: 250,
    rtp: RTP,
    ...board,
    isBonusBuy: true,
    reelSets,
    resultSets: [
      rs({ criteria: "bonus", quota: 0.99, fs: "bonus" }),
      rs({ criteria: "maxwin", quota: 0.001, fs: "bonus", forceMaxWin: true, userData: { boost: true } }),
    ],
  }),
  super: new GameMode({
    name: "super",
    cost: 500,
    rtp: RTP,
    ...board,
    isBonusBuy: true,
    reelSets,
    resultSets: [
      rs({ criteria: "super", quota: 0.99, fs: "super" }),
      rs({ criteria: "maxwin", quota: 0.006, fs: "super", forceMaxWin: true, userData: { boost: true } }),
    ],
  }),
  mystery: new GameMode({
    name: "mystery",
    cost: 500,
    rtp: RTP,
    ...board,
    isBonusBuy: true,
    reelSets,
    resultSets: [
      new ResultSet<UserStateType>({
        criteria: "coal",
        quota: 0.3,
        multiplier: 0,
        reelWeights,
        userData: { mystery: "coal" },
        evaluate: (ctx) => ctx.state.userData.outcome === "coal",
      }),
      rs({ criteria: "super", quota: 0.35, fs: "super", userData: { mystery: "super" } }),
      rs({ criteria: "hidden", quota: 0.33, fs: "hidden", userData: { mystery: "hidden" } }),
      rs({ criteria: "maxwin", quota: 0.02, fs: "hidden", forceMaxWin: true, userData: { mystery: "hidden", boost: true } }),
    ],
  }),
})

export type GameModesType = typeof gameModes
