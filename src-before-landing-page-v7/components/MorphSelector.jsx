import { useMemo, useState } from "react";
import { useMorphLibrary } from "../hooks/useMorphLibrary";
import { Button, Icon, useToast } from "./ui";
import { makeMorphKey } from "../data/morphLibrary";

// =====================================================
// 🟢 MorphSelector
//
// Species-aware morph / breed / variety selector.
// Users can add missing morphs to the shared library.
// =====================================================

export default function MorphSelector({
  value = "",
  onChange,
  species = "",
  category = "",
  animalGroup = "",
  label = "Morph / Breed / Variety / Strain",
}) {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { options, loading, tableReady, hasOption, addMorphOption } = useMorphLibrary({
    species,
    category,
    animalGroup,
  });

  const cleanValue = String(value || "").trim();
  const selectedKey = makeMorphKey(cleanValue);
  const optionKeys = useMemo(() => new Set(options.map((option) => makeMorphKey(option))), [options]);
  const isKnownOption = selectedKey && optionKeys.has(selectedKey);
  const selectValue = cleanValue && isKnownOption ? cleanValue : cleanValue ? "__custom__" : "";
  const canShare = Boolean(cleanValue && species && !hasOption(cleanValue));

  const handleSelect = (event) => {
    const nextValue = event.target.value;

    if (nextValue === "__custom__") return;
    onChange(nextValue);
  };

  const handleShare = async () => {
    if (!canShare || saving) return;

    try {
      setSaving(true);
      const added = await addMorphOption(cleanValue);
      onChange(added);
      showToast({
        title: "Option shared",
        message: `${added} is now available for everyone selecting ${species}.`,
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "Option not shared",
        message:
          error?.message ||
          "The shared morph library could not be updated. Make sure the morph SQL patch has been run.",
        variant: "error",
        duration: 7000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="morphSelector">
      <label>{label}</label>

      <div className="morphSelectorGrid">
        <select value={selectValue} onChange={handleSelect} disabled={!species}>
          <option value="">{species ? "Choose morph / breed / variety..." : "Choose species first..."}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          {cleanValue && !isKnownOption && <option value="__custom__">Custom: {cleanValue}</option>}
          <option value="__custom__">Custom / add missing...</option>
        </select>

        <input
          placeholder={species ? "Type custom morph, breed, variety, strain, phase, locality, or line" : "Choose a species first"}
          value={cleanValue}
          disabled={!species}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <div className="morphSelectorMeta">
        <span>
          {loading
            ? "Loading shared option library..."
            : species
              ? `${options.length} shared/starter options for ${species}`
              : "Morph/breed/variety options unlock after species selection"}
        </span>

        {canShare && (
          <Button
            size="sm"
            variant="outline"
            loading={saving}
            leftIcon={<Icon name="plus" size={14} />}
            onClick={handleShare}
          >
            Add for everyone
          </Button>
        )}
      </div>

      {!tableReady && (
        <p className="morphSelectorWarning">
          Shared option library is not connected yet. You can still type a custom value for this animal, but run the SQL patch to share options globally.
        </p>
      )}
    </div>
  );
}
