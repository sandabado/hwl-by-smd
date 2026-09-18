import { stagePasswordRecovery } from "@/lib/password-recovery"

export function GET(request: Request) {
  return stagePasswordRecovery(request)
}
