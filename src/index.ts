import { PrismaClient } from "@prisma/client";
import cp from "child_process";
import { v4 } from "uuid";

const create = async (prisma: PrismaClient): Promise<string> => {
    const article = await prisma.bbs_articles.create({
        data: {
            id: v4(),
            title: "Hello World",
            body: "This is a test article.",
            created_at: new Date(),
            files: {
                create: [
                    {
                        id: v4(),
                        file: {
                            create: {
                                id: v4(),
                                name: "robots",
                                extension: "txt",
                                url: "https://www.prisma.io/robots.txt",
                            }
                        },
                        sequence: 0,
                    }
                ]
            }
        }
    });
    return article.id;
}

const read = (prisma: PrismaClient) => 
    (joinFiles: boolean) => 
    async (id: string) => {
        const article = await prisma.bbs_articles.findFirstOrThrow({
            where: { id },
            include: {
                files: joinFiles
                    ? { include: { file: {} } }
                    : undefined,
            },
        });
        console.log({
            joinFiles,
            expectedBehavior: joinFiles === !!article.files?.length,
            files: article.files,
        });
};

const main = async (): Promise<void> => {
    try {
        cp.execSync("npx prisma reset --force");
    } catch{}
    cp.execSync("npx prisma migrate dev --name init");

    const prisma = new PrismaClient();    
    const id = await create(prisma);
    await read(prisma)(true)(id);
    await read(prisma)(false)(id);
}
main().catch(exp => {
    console.error(exp);
    process.exit(-1);
})