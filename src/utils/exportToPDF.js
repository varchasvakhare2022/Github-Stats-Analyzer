import jsPDF from 'jspdf'

const removeEmojis = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .trim()
}

export const exportToPDF = async (
  profile,
  repos,
  totalStars,
  totalForks,
  languages,
  username,
  setIsExporting
) => {
  try {
    setIsExporting(true)
    
    // Validate inputs
    if (!profile || !username) {
      throw new Error('Profile data is missing')
    }
    
    if (!repos || repos.length === 0) {
      throw new Error('No repositories to export')
    }
    
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    const labelWidth = 70
    const valueStartX = margin + labelWidth + 3
    let yPosition = margin

    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin - 20) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    const addText = (text, x, y, maxWidth, fontSize = 12, align = 'left', color = [0, 0, 0], font = 'helvetica', style = 'normal') => {
      if (!text || text === 'undefined' || text === 'null') {
        return 0
      }
      try {
        const cleanText = removeEmojis(String(text))
        if (!cleanText) return 0
        
        doc.setFontSize(fontSize)
        doc.setFont(font, style)
        doc.setTextColor(color[0], color[1], color[2])
        const lines = doc.splitTextToSize(cleanText, maxWidth)
        doc.text(lines, x, y, { align })
        return lines.length * (fontSize * 0.35) + 3
      } catch (error) {
        console.error('Error adding text to PDF:', error)
        return 0
      }
    }

    const addSectionHeader = (title, yPos) => {
      checkPageBreak(20)
      doc.setFontSize(18)
      doc.setTextColor(16, 185, 129)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin, yPos)
      doc.setDrawColor(16, 185, 129)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3)
      return yPos + 12
    }

    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text('GitHub Profile Report', pageWidth / 2, 25, { align: 'center' })
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'normal')
    doc.text(`@${username}`, pageWidth / 2, 38, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setTextColor(240, 253, 250)
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.text(`Generated on ${dateStr}`, pageWidth / 2, 45, { align: 'center' })

    yPosition = 60

    yPosition = addSectionHeader('Profile Information', yPosition)
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    
    const addLabelValue = (label, value, yPos, valueColor = [0, 0, 0], wrapValue = false) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      
      const labelText = label + ':'
      const maxLabelWidth = labelWidth
      const lineHeight = 12 * 0.4
      const fontSize = 12
      
      const labelLines = doc.splitTextToSize(labelText, maxLabelWidth)
      const labelHeight = labelLines.length > 1 ? (labelLines.length * lineHeight) + 2 : lineHeight
      
      if (labelLines.length > 1) {
        labelLines.forEach((line, index) => {
          const lineY = yPos + (index * lineHeight)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(fontSize)
          doc.setTextColor(0, 0, 0)
          doc.text(line, margin, lineY)
        })
      } else {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(fontSize)
        doc.setTextColor(0, 0, 0)
        doc.text(labelLines[0], margin, yPos)
      }
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(fontSize)
      doc.setTextColor(valueColor[0], valueColor[1], valueColor[2])
      
      if (wrapValue && typeof value === 'string' && value.length > 40) {
        const maxValueWidth = pageWidth - valueStartX - margin
        const valueHeight = addText(value, valueStartX, yPos, maxValueWidth, 11, 'left', valueColor)
        doc.setTextColor(0, 0, 0)
        return Math.max(labelHeight, valueHeight) + 4
      } else {
        doc.text(String(value), valueStartX, yPos)
        doc.setTextColor(0, 0, 0)
        return labelHeight + 4
      }
    }
    
    if (profile.name) {
      const nameHeight = addLabelValue('Name', profile.name, yPosition)
      yPosition += nameHeight
    }
    
    const usernameHeight = addLabelValue('Username', `@${profile.login}`, yPosition)
    yPosition += usernameHeight
    
    if (profile.bio) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('Bio:', margin, yPosition)
      doc.setFont('helvetica', 'normal')
      const maxBioWidth = pageWidth - valueStartX - margin
      const bioHeight = addText(profile.bio, valueStartX, yPosition, maxBioWidth, 11)
      yPosition += Math.max(bioHeight, 8) + 3
    }
    
    const locationHeight = addLabelValue('Location', profile.location || 'Not specified', yPosition)
    yPosition += locationHeight
    
    const companyHeight = addLabelValue('Company', profile.company || 'Not specified', yPosition)
    yPosition += companyHeight
    
    if (profile.blog) {
      const websiteHeight = addLabelValue('Website', profile.blog, yPosition, [59, 130, 246])
      yPosition += websiteHeight
    }
    
    const createdDate = new Date(profile.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const memberSinceHeight = addLabelValue('Member since', createdDate, yPosition)
    yPosition += memberSinceHeight + 3

    yPosition = addSectionHeader('Social Statistics', yPosition)
    
    doc.setFontSize(12)
    const followersHeight = addLabelValue('Followers', profile.followers.toLocaleString(), yPosition, [16, 185, 129])
    yPosition += followersHeight
    
    const followingHeight = addLabelValue('Following', profile.following.toLocaleString(), yPosition, [16, 185, 129])
    yPosition += followingHeight
    
    const reposHeight = addLabelValue('Public Repositories', profile.public_repos.toString(), yPosition, [16, 185, 129])
    yPosition += reposHeight
    
    if (profile.followers > 0) {
      const ratio = (profile.following / profile.followers).toFixed(2)
      const ratioHeight = addLabelValue('Following/Followers Ratio', ratio, yPosition, [16, 185, 129])
      yPosition += ratioHeight
    }
    yPosition += 5

    yPosition = addSectionHeader('Repository Statistics', yPosition)
    
    doc.setFontSize(12)
    const starsHeight = addLabelValue('Total Stars', totalStars.toLocaleString(), yPosition, [255, 193, 7])
    yPosition += starsHeight
    
    const forksHeight = addLabelValue('Total Forks', totalForks.toLocaleString(), yPosition, [76, 175, 80])
    yPosition += forksHeight
    
    const totalReposHeight = addLabelValue('Total Repositories', repos.length.toString(), yPosition)
    yPosition += totalReposHeight + 3

    if (languages && Object.keys(languages).length > 0 && repos.length > 0) {
      yPosition = addSectionHeader('Language Distribution', yPosition)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      const sortedLanguages = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .filter(([lang, count]) => lang && count > 0)

      if (sortedLanguages.length > 0) {
        const colors = [
          [59, 130, 246],   // blue
          [16, 185, 129],   // emerald
          [245, 158, 11],   // amber
          [239, 68, 68],    // red
          [139, 92, 246],   // violet
          [236, 72, 153],   // pink
          [6, 182, 212],    // cyan
          [132, 204, 22],   // lime
          [249, 115, 22],   // orange
          [99, 102, 241],   // indigo
        ]

        sortedLanguages.forEach(([lang, count], index) => {
          try {
            checkPageBreak(15)
            const percentage = ((count / repos.length) * 100).toFixed(1)
            const barMaxWidth = contentWidth - labelWidth - 10
            const barWidth = Math.max(5, (barMaxWidth * percentage) / 100)
            const barHeight = 6
            const barY = yPosition + 3
            const barStartX = valueStartX
            
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'bold')
            doc.text(`${lang}:`, margin, yPosition)
            
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            const statsText = `${count} repos (${percentage}%)`
            doc.text(statsText, valueStartX, yPosition)
            
            const colorIndex = index % colors.length
            const selectedColor = colors[colorIndex]
            if (selectedColor && Array.isArray(selectedColor) && selectedColor.length === 3) {
              doc.setFillColor(selectedColor[0], selectedColor[1], selectedColor[2])
              doc.rect(barStartX, barY, barWidth, barHeight, 'F')
              doc.setDrawColor(selectedColor[0], selectedColor[1], selectedColor[2])
              doc.setLineWidth(0.1)
              doc.rect(barStartX, barY, barWidth, barHeight, 'S')
            }
            
            yPosition += 12
          } catch (error) {
            console.error(`Error processing language:`, error)
          }
        })
        yPosition += 5
      }
    }

    yPosition = addSectionHeader('Top Repositories', yPosition)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    
    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 30)
    
    topRepos.forEach((repo, index) => {
      try {
        checkPageBreak(35)
        
        if (!repo || !repo.name) {
          return
        }
        
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(16, 185, 129)
        doc.setFontSize(12)
        const repoName = `${index + 1}. ${repo.name}`
        doc.text(repoName, margin, yPosition)
        yPosition += 7
        
        if (repo.html_url) {
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(59, 130, 246)
          doc.setFontSize(9)
          const urlLines = doc.splitTextToSize(repo.html_url, contentWidth - 10)
          doc.text(urlLines, margin + 5, yPosition)
          yPosition += urlLines.length * 4 + 2
        }
        
        if (repo.description) {
          doc.setTextColor(60, 60, 60)
          doc.setFontSize(10)
          const descHeight = addText(
            repo.description,
            margin + 5,
            yPosition,
            contentWidth - 10,
            10
          )
          yPosition += descHeight + 2
        }
        
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        const stars = repo.stargazers_count || 0
        const forks = repo.forks_count || 0
        const updatedDate = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'N/A'
        const stats = `Stars: ${stars.toLocaleString()} | Forks: ${forks.toLocaleString()} | Language: ${repo.language || 'N/A'} | Updated: ${updatedDate}`
        const statsLines = doc.splitTextToSize(stats, contentWidth - 10)
        doc.text(statsLines, margin + 5, yPosition)
        yPosition += statsLines.length * 4 + 5
        
        if (index < topRepos.length - 1) {
          doc.setDrawColor(220, 220, 220)
          doc.setLineWidth(0.2)
          doc.line(margin, yPosition, pageWidth - margin, yPosition)
          yPosition += 5
        }
      } catch (error) {
        console.error(`Error processing repository:`, error)
      }
    })

    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
      doc.text(
        'Generated by GitHub Stats Analyzer by Varchasva Khare',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      )
    }

    const fileName = `github-stats-${username}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    
    setIsExporting(false)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    setIsExporting(false)
    throw error
  }
}
