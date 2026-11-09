import caseDocuments from './caseDocuments.json'
import { projects as projectCatalog, type Project } from './portfolio'

type DocumentId = keyof typeof caseDocuments

/** Heavy editorial data is loaded only with the project route. */
export const caseProjects: Project[] = projectCatalog.map(project => {
  if (project.videos) return project
  const id = project.id as DocumentId
  return {
    ...project,
    document: caseDocuments[id],
  }
})
