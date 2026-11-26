import {
  ACTIONS,
  MODULE_METADATA,
  MODULES,
  isActionSupported,
} from '../../utils/permissions.js'

export default function PermissionMatrix({
  permissions,
  onChange,
  readOnly = false,
  isCellDisabled,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Module
            </th>
            {ACTIONS.map((action) => (
              <th
                className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                key={action}
              >
                {action}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {MODULES.map((moduleKey) => {
            const { label } = MODULE_METADATA[moduleKey]
            return (
              <tr
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                key={moduleKey}
              >
                <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                  {label}
                </td>
                {ACTIONS.map((actionKey) => {
                  const supported = isActionSupported(moduleKey, actionKey)
                  const checked =
                    supported && permissions?.[moduleKey]?.[actionKey] === true
                  const customDisabled = isCellDisabled
                    ? isCellDisabled(moduleKey, actionKey)
                    : false
                  const disabled = readOnly || !supported || customDisabled

                  return (
                    <td className="px-3 py-2.5 text-center" key={actionKey}>
                      {supported ? (
                        <input
                          aria-label={`${label} ${actionKey}`}
                          checked={checked}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
                          disabled={disabled}
                          onChange={(event) =>
                            onChange?.(moduleKey, actionKey, event.target.checked)
                          }
                          type="checkbox"
                        />
                      ) : (
                        <span
                          className="text-xs text-slate-400 dark:text-slate-600"
                          title="Operation not supported for this module"
                        >
                          —
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

