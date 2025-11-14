import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

export interface Filters {
  categories: string[];
  genders: string[];
  colors: string[];
  sizes: string[];
  materials: string[];
  brands: string[];
  priceRange: [number, number];
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  availableCategories?: string[];
  availableGenders?: string[];
  isMobile?: boolean;
}

const categories = ["Top Wear", "Bottom Wear", "Footwear", "Accessories"];
const genders = ["Men", "Women", "Kids", "Unisex"];
const colors = [
  "Black",
  "White",
  "Blue",
  "Red",
  "Navy",
  "Grey",
  "Pink",
  "Green",
];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const materials = [
  "Cotton",
  "Wool",
  "Denim",
  "Silk",
  "Linen",
  "Polyester",
  "Viscose",
];
const brands = [
  "Street Style",
  "Bewakoof",
  "Urban Threads",
  "Fastionista",
  "Cantabil",
  "Chicstyle",
];

const FilterSidebar = ({
  filters,
  onFilterChange,
  availableCategories,
  availableGenders,
  isMobile = false,
}: FilterSidebarProps) => {
  const handleCheckboxChange = (
    filterType: keyof Filters,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterType] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    onFilterChange({ ...filters, [filterType]: newValues });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const displayCategories = availableCategories || categories;
  const displayGenders = availableGenders || genders;

  const containerClass = isMobile
    ? "w-full p-6"
    : "w-64 border-r bg-muted/30 p-6";
  const scrollAreaClass = isMobile ? "h-[60vh]" : "h-[calc(100vh-200px)]";

  return (
    <div className={containerClass}>
      <h2 className="text-lg font-semibold mb-6">Filters</h2>

      <ScrollArea className={scrollAreaClass}>
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-3">Category</h3>
            <div className="space-y-2">
              {displayCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "categories",
                        category,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Gender */}
          <div>
            <h3 className="font-medium mb-3">Gender</h3>
            <div className="space-y-2">
              {displayGenders.map((gender) => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={filters.genders.includes(gender)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "genders",
                        gender,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`gender-${gender}`}
                    className="text-sm cursor-pointer"
                  >
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div>
            <h3 className="font-medium mb-3">Colors</h3>
            <div className="space-y-2">
              {colors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={filters.colors.includes(color)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("colors", color, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`color-${color}`}
                    className="text-sm cursor-pointer"
                  >
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sizes */}
          <div>
            <h3 className="font-medium mb-3">Sizes</h3>
            <div className="space-y-2">
              {sizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={filters.sizes.includes(size)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("sizes", size, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`size-${size}`}
                    className="text-sm cursor-pointer"
                  >
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Materials */}
          <div>
            <h3 className="font-medium mb-3">Material</h3>
            <div className="space-y-2">
              {materials.map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={`material-${material}`}
                    checked={filters.materials.includes(material)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "materials",
                        material,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`material-${material}`}
                    className="text-sm cursor-pointer"
                  >
                    {material}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Brands */}
          <div>
            <h3 className="font-medium mb-3">Brand</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("brands", brand, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-sm cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="space-y-4">
              <Slider
                min={0}
                max={200}
                step={10}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default FilterSidebar;
