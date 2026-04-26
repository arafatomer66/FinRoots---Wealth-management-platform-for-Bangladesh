/**
 * Islamic Inheritance Calculator — Hanafi School (Bangladesh)
 *
 * Rules:
 * - Fixed sharers (Dhawil-Furud) get predetermined fractions
 * - Residuaries (Asabah) get the remainder
 * - Will (Wasiyyah) limited to 1/3 of estate, cannot be to a legal heir
 * - If shares exceed estate, proportional reduction (Awl)
 */

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  gender: string;
  is_minor: boolean;
}

interface ShareResult {
  memberId: number;
  name: string;
  relationship: string;
  fraction: string;
  percentage: number;
  amount: number;
  basis: string;
}

export function calculateMuslimInheritance(
  estateValue: number,
  familyMembers: FamilyMember[],
  willAmount: number = 0,
): { shares: ShareResult[]; distributableEstate: number; willAmount: number; notes: string[] } {
  const notes: string[] = [];

  // Will limited to 1/3 of estate
  const maxWill = estateValue / 3;
  const actualWill = Math.min(willAmount, maxWill);
  if (willAmount > maxWill) {
    notes.push(`Will reduced from ৳${willAmount.toLocaleString()} to ৳${maxWill.toLocaleString()} (max 1/3 of estate)`);
  }

  const distributableEstate = estateValue - actualWill;
  const shares: ShareResult[] = [];

  // Count heirs by relationship
  const spouse = familyMembers.find(m => m.relationship === 'spouse');
  const sons = familyMembers.filter(m => m.relationship === 'son');
  const daughters = familyMembers.filter(m => m.relationship === 'daughter');
  const father = familyMembers.find(m => m.relationship === 'father');
  const mother = familyMembers.find(m => m.relationship === 'mother');
  const hasChildren = sons.length > 0 || daughters.length > 0;

  // 1. Spouse share
  if (spouse) {
    const spouseFraction = spouse.gender === 'female'
      ? (hasChildren ? 1 / 8 : 1 / 4)  // Wife: 1/8 with children, 1/4 without
      : (hasChildren ? 1 / 4 : 1 / 2);  // Husband: 1/4 with children, 1/2 without

    const fractionStr = spouse.gender === 'female'
      ? (hasChildren ? '1/8' : '1/4')
      : (hasChildren ? '1/4' : '1/2');

    shares.push({
      memberId: spouse.id,
      name: spouse.name,
      relationship: 'spouse',
      fraction: fractionStr,
      percentage: spouseFraction * 100,
      amount: distributableEstate * spouseFraction,
      basis: `Spouse share (${hasChildren ? 'with' : 'without'} children)`,
    });
  }

  // 2. Mother's share
  if (mother) {
    const motherFraction = hasChildren ? 1 / 6 : 1 / 3;
    shares.push({
      memberId: mother.id,
      name: mother.name,
      relationship: 'mother',
      fraction: hasChildren ? '1/6' : '1/3',
      percentage: motherFraction * 100,
      amount: distributableEstate * motherFraction,
      basis: `Mother's fixed share (${hasChildren ? 'with' : 'without'} children)`,
    });
  }

  // 3. Father's share
  if (father) {
    if (hasChildren) {
      // Father gets 1/6 as fixed share + residuary if no sons
      const fatherFraction = 1 / 6;
      shares.push({
        memberId: father.id,
        name: father.name,
        relationship: 'father',
        fraction: '1/6',
        percentage: fatherFraction * 100,
        amount: distributableEstate * fatherFraction,
        basis: "Father's fixed share (with children)",
      });
    }
    // Without children, father is residuary (handled below)
  }

  // 4. Children — residuary distribution
  const totalFixedShares = shares.reduce((sum, s) => sum + s.percentage, 0) / 100;
  let residuary = distributableEstate * (1 - totalFixedShares);

  if (sons.length > 0) {
    // Sons get 2x daughter's share
    const totalShares = sons.length * 2 + daughters.length;
    const shareUnit = residuary / totalShares;

    for (const son of sons) {
      shares.push({
        memberId: son.id,
        name: son.name,
        relationship: 'son',
        fraction: `2/${totalShares}`,
        percentage: ((shareUnit * 2) / distributableEstate) * 100,
        amount: shareUnit * 2,
        basis: 'Son (residuary — 2x daughter share)',
      });
    }

    for (const daughter of daughters) {
      shares.push({
        memberId: daughter.id,
        name: daughter.name,
        relationship: 'daughter',
        fraction: `1/${totalShares}`,
        percentage: (shareUnit / distributableEstate) * 100,
        amount: shareUnit,
        basis: 'Daughter (residuary — 1/2 of son share)',
      });
    }
  } else if (daughters.length > 0) {
    // Only daughters, no sons
    if (daughters.length === 1) {
      const daughterShare = distributableEstate * (1 / 2);
      shares.push({
        memberId: daughters[0].id,
        name: daughters[0].name,
        relationship: 'daughter',
        fraction: '1/2',
        percentage: 50,
        amount: Math.min(daughterShare, residuary),
        basis: 'Sole daughter (fixed share 1/2)',
      });
      residuary -= Math.min(daughterShare, residuary);
    } else {
      const totalDaughterShare = distributableEstate * (2 / 3);
      const perDaughter = Math.min(totalDaughterShare, residuary) / daughters.length;
      for (const daughter of daughters) {
        shares.push({
          memberId: daughter.id,
          name: daughter.name,
          relationship: 'daughter',
          fraction: `2/3 ÷ ${daughters.length}`,
          percentage: (perDaughter / distributableEstate) * 100,
          amount: perDaughter,
          basis: 'Daughters share 2/3 equally',
        });
      }
      residuary -= Math.min(totalDaughterShare, residuary);
    }

    // Father gets residuary if present and no sons
    if (father && !hasChildren) {
      shares.push({
        memberId: father.id,
        name: father.name,
        relationship: 'father',
        fraction: 'Residuary',
        percentage: (residuary / distributableEstate) * 100,
        amount: residuary,
        basis: 'Father as residuary (no sons)',
      });
    }
  }

  // Check for Awl (proportional reduction if shares exceed 100%)
  const totalPercentage = shares.reduce((sum, s) => sum + s.percentage, 0);
  if (totalPercentage > 100.01) {
    notes.push(`Awl applied: shares total ${totalPercentage.toFixed(1)}%, proportionally reduced`);
    const factor = 100 / totalPercentage;
    for (const share of shares) {
      share.percentage *= factor;
      share.amount = distributableEstate * (share.percentage / 100);
    }
  }

  return { shares, distributableEstate, willAmount: actualWill, notes };
}
