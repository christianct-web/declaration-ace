import { useDeclarationStore } from "@/store/declarationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Trash2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFieldError } from "@/services/validationService";
import { useState } from "react";

interface ItemsSectionProps {
  declarationId: string;
}

export default function ItemsSection({ declarationId }: ItemsSectionProps) {
  const { getDeclaration, addItem, updateItem, removeItem, duplicateItem } =
    useDeclarationStore();
  const declaration = getDeclaration(declarationId);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (!declaration) return null;

  const items = declaration.payload_json.items;
  const validationReport = declaration.last_validation_report;

  const getItemError = (index: number, field: string) =>
    getFieldError(validationReport, `items[${index}].${field}`);

  const hasItemsError =
    validationReport?.errors.some((e) => e.path === "items") ?? false;

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleNumberChange = (itemId: string, field: string, value: string) => {
    updateItem(declarationId, itemId, {
      [field]: value === "" ? undefined : parseFloat(value),
    });
  };

  const handleIntChange = (itemId: string, field: string, value: string) => {
    updateItem(declarationId, itemId, {
      [field]: value === "" ? undefined : parseInt(value),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Line Items
          </h2>
          <p className="text-sm text-muted-foreground">
            Add goods and commodities with HS codes for customs classification
          </p>
        </div>
        <Button
          onClick={() => addItem(declarationId)}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Items Error */}
      {hasItemsError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          At least one line item is required
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No items yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your first line item to this declaration
          </p>
          <Button onClick={() => addItem(declarationId)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div
            className="grid gap-3 p-3 bg-muted/50 border-b text-sm font-semibold text-foreground items-center"
            style={{ gridTemplateColumns: "auto auto 1fr 2fr 1fr 0.7fr auto" }}
          >
            <span className="w-6"></span>
            <span className="w-8">#</span>
            <span>HS Code *</span>
            <span>Description</span>
            <span>Origin</span>
            <span>Packages</span>
            <span className="w-20">Actions</span>
          </div>

          {/* Item Rows */}
          {items.map((item, index) => {
            const hsCodeError = getItemError(
              index,
              "tarification_hscode_commodity_code"
            );
            const isExpanded = expandedItems.has(item.id);

            return (
              <div key={item.id} className="border-b last:border-b-0">
                {/* Main Row */}
                <div
                  className="grid gap-3 p-3 items-start hover:bg-muted/30 transition-colors"
                  style={{ gridTemplateColumns: "auto auto 1fr 2fr 1fr 0.7fr auto" }}
                >
                  {/* Expand Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-6"
                    onClick={() => toggleExpand(item.id)}
                    title="Show weight, value & duty fields"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Line Number */}
                  <span className="w-8 text-sm font-mono text-muted-foreground pt-2">
                    {item.line_number}
                  </span>

                  {/* HS Code - Required */}
                  <div className="space-y-1">
                    <Input
                      value={item.tarification_hscode_commodity_code || ""}
                      onChange={(e) =>
                        updateItem(declarationId, item.id, {
                          tarification_hscode_commodity_code: e.target.value,
                        })
                      }
                      placeholder="e.g., 8471.30.00"
                      className={cn(
                        "font-mono text-sm",
                        hsCodeError && "field-error"
                      )}
                    />
                    {hsCodeError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Required
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <Input
                    value={item.description || ""}
                    onChange={(e) =>
                      updateItem(declarationId, item.id, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Goods description"
                    className="text-sm"
                  />

                  {/* Country of Origin */}
                  <Input
                    value={item.country_of_origin || ""}
                    onChange={(e) =>
                      updateItem(declarationId, item.id, {
                        country_of_origin: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., CN"
                    maxLength={2}
                    className="font-mono text-sm uppercase"
                  />

                  {/* Packages */}
                  <Input
                    type="number"
                    value={item.packages_number ?? ""}
                    onChange={(e) =>
                      handleIntChange(item.id, "packages_number", e.target.value)
                    }
                    placeholder="0"
                    className="font-mono text-sm"
                    min={0}
                  />

                  {/* Actions */}
                  <div className="flex gap-1 w-20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => duplicateItem(declarationId, item.id)}
                      title="Duplicate item"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(declarationId, item.id)}
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Detail Row */}
                {isExpanded && (
                  <div className="px-3 pb-4 pt-1 bg-muted/20 border-t border-dashed">
                    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                      {/* Packages Kind */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Package Type</Label>
                        <Input
                          value={item.packages_kind || ""}
                          onChange={(e) =>
                            updateItem(declarationId, item.id, {
                              packages_kind: e.target.value,
                            })
                          }
                          placeholder="e.g., CT, PK"
                          className="text-sm font-mono"
                        />
                      </div>

                      {/* Gross Weight */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Gross Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={item.gross_weight ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "gross_weight", e.target.value)
                          }
                          placeholder="0.000"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Net Weight */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Net Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={item.net_weight ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "net_weight", e.target.value)
                          }
                          placeholder="0.000"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "quantity", e.target.value)
                          }
                          placeholder="0"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Unit of Measure */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Unit of Measure</Label>
                        <Input
                          value={item.unit_of_measure || ""}
                          onChange={(e) =>
                            updateItem(declarationId, item.id, {
                              unit_of_measure: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="e.g., KG, M, U"
                          className="font-mono text-sm uppercase"
                        />
                      </div>

                      {/* Statistical Value */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Statistical Value</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.statistical_value ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "statistical_value", e.target.value)
                          }
                          placeholder="0.00"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Customs Value */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Customs Value</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.customs_value ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "customs_value", e.target.value)
                          }
                          placeholder="0.00"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Duty Rate */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Duty Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.duty_rate ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "duty_rate", e.target.value)
                          }
                          placeholder="0.00"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Duty Amount */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Duty Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.duty_amount ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "duty_amount", e.target.value)
                          }
                          placeholder="0.00"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* VAT Rate */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">VAT Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.vat_rate ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "vat_rate", e.target.value)
                          }
                          placeholder="0.00"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* VAT Amount */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">VAT Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.vat_amount ?? ""}
                          onChange={(e) =>
                            handleNumberChange(item.id, "vat_amount", e.target.value)
                          }
                          placeholder="0.00"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Additional Code */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Additional Code</Label>
                        <Input
                          value={item.additional_code || ""}
                          onChange={(e) =>
                            updateItem(declarationId, item.id, {
                              additional_code: e.target.value,
                            })
                          }
                          placeholder="Code"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Preference Code */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Preference Code</Label>
                        <Input
                          value={item.preference_code || ""}
                          onChange={(e) =>
                            updateItem(declarationId, item.id, {
                              preference_code: e.target.value,
                            })
                          }
                          placeholder="Code"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-4">
            <span>
              Packages:{" "}
              {items.reduce((sum, item) => sum + (item.packages_number || 0), 0)}
            </span>
            <span>
              Gross Wt:{" "}
              {items
                .reduce((sum, item) => sum + (item.gross_weight || 0), 0)
                .toFixed(3)}{" "}
              kg
            </span>
            <span>
              Net Wt:{" "}
              {items
                .reduce((sum, item) => sum + (item.net_weight || 0), 0)
                .toFixed(3)}{" "}
              kg
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
