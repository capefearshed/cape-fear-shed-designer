// Cape Fear Shed verified designer specifications (inches unless noted).
// Source: owner-confirmed measurements and cut-list handoff, October 2026.
// This module is visual-designer reference, not a structural engineering approval.
export const constructionSpecs = Object.freeze({
  siding: {
    lpPanel: {
      grooveWidthIn: 3/8,
      grooveDepthIn: 3/16,
      grooveSpacingIn: 8,
      panelNominalWidthIn: 48,
      panelHeightIn: 96,
      woodGrain: true,
      defaultColor: { name: 'Outerbanks', code: 'SW 7534', hex: '#B7A48B' },
      trim: { widthIn: 3.5, thicknessIn: .75, headerProjectionEachEndIn: .5 },
    },
  },
  doubleDoor4Ft: {
    leafWidthIn: 24, leafHeightIn: 73.5, revealIn: 7/16,
    hingesPerLeaf: 3, steelThicknessIn: 1/8, barrelDiameterIn: .5,
  },
  standardWindow: {
    overallWidthIn: 19.75, overallHeightIn: 28.5,
    sideTrimLengthIn: 27+3/8, headSillTrimLengthIn: 26.25,
    flangeOverlapIn: .75, trimProjectionIn: .75,
    frameColor: '#E2E4E1',
  },
  foundation: {
    tuffBlocksByLengthFt: [[10,4],[14,6],[20,8],[Infinity,10]],
    centerGirderWidthsFt: [12,14],
    skidWidthFt: 16, skidCount: 3,
  },
});
