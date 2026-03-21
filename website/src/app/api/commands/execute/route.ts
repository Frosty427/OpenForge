import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

const COMMAND_OUTPUTS: Record<string, (prompt: string) => string> = {
  "list files": () => `$ ls -la
total 48
drwxr-xr-x  12 user  staff   384 Mar 20 10:00 .
drwxr-xr-x   5 user  staff   160 Mar 20 09:00 ..
-rw-r--r--   1 user  staff  1234 Mar 20 10:00 .env
-rw-r--r--   1 user  staff  4567 Mar 20 10:00 package.json
drwxr-xr-x   4 user  staff   128 Mar 20 10:00 node_modules
-rw-r--r--   1 user  staff   891 Mar 20 10:00 tsconfig.json
drwxr-xr-x   3 user  staff    96 Mar 20 10:00 src
-rw-r--r--   1 user  staff  2048 Mar 20 10:00 README.md`,

  "ls": () => `$ ls
package.json  node_modules  src  tsconfig.json  .env  README.md`,

  "pwd": () => `$ pwd
/home/user/openforge`,

  "whoami": () => `$ whoami
user`,

  "date": () => `$ date
${new Date().toString()}`,

  "ps": () => `$ ps aux
USER       PID  %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1   0.0  0.1  2064   628 ?        Ss   10:00   0:00 /sbin/init
user       234   0.2  1.2 45120  8796 ?        S    10:00   0:03 node server.js
user       567   0.1  0.8 32400  5120 pts/0    Ss   10:01   0:01 bash
user       890   0.0  0.3  7600  1800 pts/0    R+   10:15   0:00 ps aux`,

  "uptime": () => `$ uptime
 10:15:23 up 2:34,  1 user,  load average: 0.12, 0.08, 0.05`,

  "df": () => `$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       500G   82G  393G  18% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
/dev/sdb1       1.0T  245G  755G  25% /data`,

  "free": () => `$ free -h
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       2.1Gi       3.4Gi       124Mi       2.3Gi       5.2Gi
Swap:         2.0Gi          0B       2.0Gi`,

  "env": () => `$ env | head -10
PATH=/usr/local/bin:/usr/bin:/bin
HOME=/home/user
SHELL=/bin/bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/openforge
JWT_SECRET=****
OPENAI_API_KEY=sk-****
ANTHROPIC_API_KEY=sk-ant-****`,

  "npm start": () => `$ npm start

> openforge@1.0.0 start
> next start

- ready started server on 0.0.0.0:3000, url: http://localhost:3000`,

  "npm run dev": () => `$ npm run dev

> openforge@1.0.0 dev
> next dev

- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully in 1200ms (234 modules)`,

  "npm test": () => `$ npm test

> openforge@1.0.0 test
> jest --coverage

PASS  src/lib/utils.test.ts
PASS  src/lib/auth.test.ts
PASS  src/components/Button.test.tsx

Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        3.456 s
Ran all test suites.`,

  "npm run build": () => `$ npm run build

> openforge@1.0.0 build
> next build

- info Creating an optimized production build
- info Compiled successfully
- info Collecting page data
- info Generating static pages (0/12)
- info Generating static pages (3/12)
- info Generating static pages (6/12)
- info Generating static pages (9/12)
- info Generating static pages (12/12)
- info Finalizing page optimization

Route (app)                Size     First Load JS
┌ ○ /                      4.2 kB          89 kB
├ ○ /blog                  1.1 kB          86 kB
├ ○ /docs                  2.3 kB          87 kB
├ ○ /login                 1.8 kB          87 kB
├ ○ /register              2.0 kB          87 kB
├ ○ /dashboard             5.1 kB          90 kB
└ ○ /support               1.4 kB          86 kB
○  (Static)  prerendered as static content`,

  "docker ps": () => `$ docker ps
CONTAINER ID   IMAGE           COMMAND       CREATED        STATUS        PORTS                    NAMES
a1b2c3d4e5f6   postgres:16     "docker-…"    2 hours ago    Up 2 hours    0.0.0.0:5432->5432/tcp   openforge-db
f6e5d4c3b2a1   redis:7-alpine  "redis-…"     2 hours ago    Up 2 hours    0.0.0.0:6379->6379/tcp   openforge-redis`,

  "git status": () => `$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/app/api/auth/login/route.ts
        modified:   src/components/Header.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/app/api/commands/

no changes added to commit (use "git add <file>..." to commit)`,

  "git log": () => `$ git log --oneline -5
a1b2c3d (HEAD -> main, origin/main) feat: add command execution API
e4f5a6b fix: auth token validation issue
b7c8d9e feat: implement blog post listing
c0d1e2f chore: update dependencies to latest
f3a4b5c feat: initial project setup`,

  "git diff": () => `$ git diff --stat
 src/app/api/auth/login/route.ts | 12 ++++++------
 src/components/Header.tsx       |  8 ++++----
 2 files changed, 10 insertions(+), 10 deletions(-)`,

  "curl": () => `$ curl -s http://localhost:3000/api/health
{"status":"ok","uptime":"2h34m","version":"1.0.0"}`,

  "ping": () => `$ ping -c 4 localhost
PING localhost (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost: icmp_seq=1 ttl=64 time=0.042 ms
64 bytes from localhost: icmp_seq=2 ttl=64 time=0.038 ms
64 bytes from localhost: icmp_seq=3 ttl=64 time=0.041 ms
64 bytes from localhost: icmp_seq=4 ttl=64 time=0.039 ms

--- localhost ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3002ms
rtt min/avg/max/mdev = 0.038/0.040/0.042/0.001 ms`,

  "top": () => `$ top -b -n 1 | head -10
top - 10:15:23 up 2:34,  1 user,  load average: 0.12, 0.08, 0.05
Tasks: 142 total,   1 running, 141 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  0.8 sy,  0.0 ni, 96.7 id,  0.1 wa,  0.0 hi,  0.1 si
MiB Mem :   7972.4 total,   3482.1 free,   2156.3 used,   2334.0 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5342.1 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0    2064    628    580 S   0.0   0.1   0:00.12 init
    234 user      20   0  45120   8796   7200 S   0.2   1.2   0:03.45 node
    567 user      20   0  32400   5120   4400 S   0.1   0.8   0:01.23 bash`,

  "neofetch": () => `       _,met$$$$$gg.
    ,g$$$$$$$$$$$$$$$P.
  ,g$$P"     """Y$$.".        user@openforge
 ,$$P'              \`$$$.     ----------------
',$$P       ,ggs.     \`$$b:   OS: Ubuntu 22.04 LTS x86_64
\`d$$'     ,$P"'   .    $$$    Host: OpenForge VM
  $$P      d$'     ,    $$P   Kernel: 5.15.0-generic
  $$:      $$.   -    ,d$$'   Uptime: 2 hours, 34 mins
  $$;      Y$b._   _,d$P'     Packages: 1247 (dpkg)
  Y$$.    \`.\`"Y$$$$P"'       Shell: bash 5.1.16
  \`$$b      "-.__             Terminal: /dev/pts/0
    \`Y$$                      CPU: Intel i7-12700 (8) @ 4.80GHz
      \`Y$$.                   Memory: 2156MiB / 7972MiB
        \`$$b.
          \`Y$$b.
             \`"Y$b._
                 \`"""`,
};

function generateSimulatedOutput(prompt: string): string {
  const normalizedPrompt = prompt.toLowerCase().trim();

  for (const [key, generator] of Object.entries(COMMAND_OUTPUTS)) {
    if (normalizedPrompt.includes(key)) {
      return generator(prompt);
    }
  }

  const words = prompt.split(/\s+/).length;
  const lines = Math.max(3, Math.min(15, words * 2));
  const simulatedLines: string[] = [`$ ${prompt}`];

  for (let i = 0; i < lines; i++) {
    const hex = Math.random().toString(16).substring(2, 10);
    const size = Math.floor(Math.random() * 4096) + 64;
    simulatedLines.push(`[${i + 1}/${lines}] Processed: 0x${hex} (${size} bytes)`);
  }

  simulatedLines.push("");
  simulatedLines.push(`Execution completed in ${(Math.random() * 2 + 0.1).toFixed(3)}s`);
  simulatedLines.push(`Exit code: 0`);

  return simulatedLines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { prompt, provider, model } = await req.json();

    if (!prompt || !provider) {
      return NextResponse.json(
        { error: "prompt and provider are required" },
        { status: 400 }
      );
    }

    const command = await prisma.command.create({
      data: {
        prompt,
        provider,
        model: model || null,
        status: "executing",
        userId: payload.userId,
      },
    });

    const output = generateSimulatedOutput(prompt);

    const updatedCommand = await prisma.command.update({
      where: { id: command.id },
      data: {
        output,
        status: "completed",
      },
    });

    return NextResponse.json({ command: updatedCommand });
  } catch (error) {
    console.error("Command execute error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
