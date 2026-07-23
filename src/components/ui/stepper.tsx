import { CheckCircleIcon } from "@/components/icon/icons";
import { cn } from "@/lib/utils/cn";

type Step = {
  label: string;
};

export function Stepper({ currentStep, steps }: { currentStep: number; steps: readonly Step[] }) {
  return (
    <>
      <ol aria-label="ขั้นตอนการสร้างรายการ" className="hidden items-start md:flex">
        {steps.map((step, index) => {
          const number = index + 1;
          const completed = number < currentStep;
          const current = number === currentStep;
          const connectorProgress =
            number <= currentStep ? "w-full" : number === currentStep + 1 ? "w-[45%]" : "w-0";

          return (
            <li className="relative flex flex-1 flex-col items-center text-center" key={step.label}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-1/2 top-5 h-0.5 w-full overflow-hidden bg-slate-200"
                >
                  <span
                    className={cn(
                      "block h-full bg-primary transition-[width] duration-300 motion-reduce:transition-none",
                      connectorProgress,
                    )}
                  />
                </span>
              ) : null}
              <span
                aria-current={current ? "step" : undefined}
                className={cn(
                  "relative z-10 grid size-10 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-300 motion-reduce:transition-none",
                  completed || current
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {completed ? <CheckCircleIcon className="size-5" /> : number}
              </span>
              <span
                className={cn(
                  "mt-3 text-sm font-semibold",
                  completed || current ? "text-primary" : "text-slate-500",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="md:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            ขั้น {currentStep.toLocaleString("th-TH")} จาก {steps.length.toLocaleString("th-TH")}
          </p>
          <p className="text-sm font-semibold text-[#071a43]">{steps[currentStep - 1]?.label}</p>
        </div>
        <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <span
            className="block h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
